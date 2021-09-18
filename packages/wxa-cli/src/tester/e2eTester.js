import Builder from '../Builder';
import Schedule from '../schedule.js';
import Compiler from '../compilers/index';
import domWalker from './domWalker.js';
import Server from './server.js';
import logger from '../helpers/logger';
import simplify from '../helpers/simplifyObj';
import {applyPlugins, readFile, writeFile} from '../utils.js';
import COLOR from '../const/color';
import {DirectiveBroker} from '../directive/directiveBroker';
import crypto from 'crypto';
import debugPKG from 'debug';
import path from 'path';
import net from 'net';
import runTestCase from './wxa-e2eTest/runTestcase.js';
import runWechatTools from './wxa-e2eTest/runWechatTools.js';
import {portUsed} from './wxa-e2eTest/e2eTestCase2js.js';
import JSON5 from 'json5';
const debug = debugPKG('WXA:E2ETester');
const E2E_TEST_COMPONENT = 'wxa-e2e-record-btn';
const E2E_BACK_COMPONENT = 'wxa-e2e-test-back';
const E2E_TEST_URL = '/record';
const outRange = ['pages/index', 'pages/home', 'pages/find', 'pages/discount'];
const LIB_VERSION = '2.17.0';

 
class TesterScheduler extends Schedule {
    async $parse(dep) {
        if (dep.color === COLOR.COMPILED) return dep;
        if (dep.color === COLOR.CHANGED) dep.code = void(0);
        // calc hash
        // cause not every module is actually exists, we can not promise all module has hash here.
        let content = dep.content ? dep.content : readFile(dep.src);
        dep.content = content;
        if (content) dep.hash = crypto.createHash('md5').update(content).digest('hex');
        debug('Dep HASH: %s', dep.hash);
        try {
            const relativeSrc = path.relative(this.current, dep.src);
            const text = this.cmdOptions.verbose ? `(Hash: ${dep.hash})    ${relativeSrc}` : relativeSrc;

            this.progress.draw(text, 'COMPILING', !this.cmdOptions.verbose);
            // this.perf.markStart(relativeSrc);
            this.hooks.buildModule.call(dep);

            // loader: use custom compiler to load resource.
            await this.loader.compile(dep, this);

            // this.perf.markEnd(relativeSrc);

            if (dep.meta && dep.meta.source === this.APP_CONFIG_PATH) {
                this.tryAddGlobalTestComponent(dep);
            }

            // try to wrap wxa every app and page
            this.tryWrapWXA(dep);
            this.tryAddPolyfill(dep);
            // Inject test suite into app.js
            if (dep.meta && dep.meta.source === this.APP_SCRIPT_PATH) {
                this.tryWrapWXATestSuite(dep);
            }

            // Todo: conside if cache is necessary here.
            // debug('dep to process %O', dep);
            let compiler = new Compiler(this.wxaConfigs.resolve, this.meta, this.appConfigs, this);
            let childNodes = await compiler.parse(dep);

            compiler.destroy();

            debug('childNodes', childNodes.map((node)=>simplify(node)));
            let children = childNodes.reduce((children, node)=>{
                let child = this.findOrAddDependency(node, dep);

                if (child) children.push([child.src, child]);
                return children;
            }, []);

            // if watch mode, use childNodes to clean up the dep tree.
            // update each module's childnodes, then according to reference unlink file.
            this.cleanUpChildren(new Map(children), dep);

            // cover new childNodes
            dep.childNodes = new Map(children);

            if (dep.category === 'Entry' && dep.kind === 'json') { // 自动配置小程序配置
                this.tryAutoSetConfig(dep);
            }

            if (dep.category === 'Page' && dep.kind === 'json' ) { // 为所有的组件设置Nav样式，它会影响到自定义返回按钮
                try {
                    // console.log(dep.pagePath);
                    if (!outRange.includes(dep.pagePath)) {
                        const wxConfig = JSON5.parse(dep.code);
                        wxConfig.navigationStyle = 'custom';
                        dep.code = JSON.stringify(wxConfig);
                    }
                } catch (e) {
                    logger.warn('wrap navigationStyle fail', e);
                    this.cmdOptions.elog && this.cmdOptions.elog.warn('wrap navigationStyle fail', e);
                }
            }
            if (dep.kind === 'xml') {
                await this.tryWrapCatchTapWxs(dep);
                await domWalker(dep, this);
            }

            if (dep.category === 'Page' && dep.kind === 'xml') {
                this.tryAddTestComponent(dep);
                if (!outRange.includes(dep.pagePath)) this.tryAddBackComponent(dep);
            }

            dep.color = COLOR.COMPILED;

            // if module is app.json, then add Page entry points.
            if (dep.meta && dep.meta.source === this.APP_CONFIG_PATH) {
                let oldPages = new Map(this.$pageArray.entries());
                let newPages = this.addPageEntryPoint();
                newPages = new Map(newPages.map((page)=>[page.src, page]));
                this.cleanUpPages(newPages, oldPages);
            }

            this.calcFileSize(dep);

            this.hooks.succeedModule.call(dep);

            return dep;
        } catch (e) {
            debug('编译失败 %O', e);
            dep.color = COLOR.COMPILE_ERROR;
            this.hooks.failedModule.call(dep, e);
            throw e;
        }
    }

    tryAutoSetConfig(mdl) {
        if (!~mdl.src.indexOf('project.config.json')) return;
        const code = JSON5.parse(mdl.code);
        code.setting.urlCheck = false;
        code.libVersion = this.cmdOptions.libVersion || LIB_VERSION;
        this.cmdOptions.elog && this.cmdOptions.elog.info('set libVersion: ', code.libVersion);
        this.cmdOptions.elog && this.cmdOptions.elog.info('set urlCheck: ', code.setting.urlCheck);
        console.log('\nset libVersion: ', code.libVersion);
        console.log('set urlCheck: ', code.setting.urlCheck);
        mdl.code = JSON.stringify(code);
    }

    tryWrapCatchTapWxs(dep) { // 为CatchTap方法页面添加wxs方法
        let injectCode = `
        <wxs module="tester">
            function simulationCatchTap(event, ownerInstance) {
                ownerInstance.callMethod(event.currentTarget.dataset.tap, event);
                return false;
            }
            module.exports = {
                simulationCatchTap: simulationCatchTap
            }
        </wxs>`;
        if (!dep.isCatchTapWxs && dep.code.indexOf('catchtap') !== -1) {
            // console.log(dep.$from);
            dep.isCatchTapWxs = true;
            dep.code += injectCode;
            dep.content += injectCode;
        }
    }
    tryWrapWXATestSuite(mdl) {
        if (
            ~['app'].indexOf(mdl.category ? mdl.category.toLowerCase() : '') &&
            mdl.meta && path.extname(mdl.meta.source) === '.js' &&
            (/exports\.default/gm.test(mdl.code) || /exports\[["']default["']/gm.test(mdl.code))
        ) {
            mdl.code = `
                var __e2e__state = require('wxa://wxa-e2eTest/state.js')
                var __e2eMockWxMethod = require('wxa://wxa-e2eTest/e2eMockWxMethod.js');
                __e2eMockWxMethod.mock({state: __e2e__state});
                var __testSuitePlugin = require('wxa://wxa-e2eTest/e2eTestSuite.js');
                var __wxa__ = require('@wxa/core').wxa;
                __wxa__.use(__testSuitePlugin, {record: ${!!this.cmdOptions.record}, state: __e2e__state});
                __wxa__.overload();
                ${mdl.code}
            `;
        }
    }

    tryAddGlobalTestComponent(mdl) {
        try {
            let appConfigs = JSON5.parse(mdl.content);

            appConfigs['wxa.globalComponents'] = {
                ...appConfigs['wxa.globalComponents'],
                [E2E_TEST_COMPONENT]: 'wxa://wxa-e2eTest/e2eRecordBtn',
                [E2E_BACK_COMPONENT]: 'wxa://wxa-e2eTest/simulateBack/backNav',
            };

            mdl.code = JSON.stringify(appConfigs);
        } catch (e) {
            logger.warn('wrap global test component fail', e);
            this.cmdOptions.elog && this.cmdOptions.elog.warn('wrap global test component fail', e);
        }
    }

    tryAddTestComponent(mdl) {
        mdl.code = (mdl.code || '') + `<${E2E_TEST_COMPONENT}></${E2E_TEST_COMPONENT}>`;
    }
    tryAddBackComponent(mdl) {
        // console.log(` title: ${mdl.navigationBarTitleText}`);
        // console.log(mdl.navigationBarTitleText === 'undefined', mdl.navigationBarTitleText === undefined);
        mdl.code = `<${E2E_BACK_COMPONENT} id="c-bar" title="${mdl.navigationBarTitleText === undefined ? '' : mdl.navigationBarTitleText }" background="${mdl.navigationBarBackgroundColor}" color="${mdl.navigationBarTextStyle}" showBack="{{true}}" showHome="{{true}}" ></${E2E_BACK_COMPONENT}>` + (mdl.code || '');
    }
}

class TesterBuilder extends Builder {
    async build(cmd) {
        if (cmd.verbose) logger.info('WxaConfigs', this.wxaConfigs);

        try {
            // initial loader and entry options.
            await this.init(cmd);
        } catch (e) {
            logger.error('挂载失败', e);
            cmd.elog && cmd.elog.error('挂载失败', e);
        }
        await this.hooks.beforeRun.promise(this);

        this.scheduler = new TesterScheduler(this.loader);
        this.directiveBroker = new DirectiveBroker(this.scheduler);

        applyPlugins(this.wxaConfigs.plugins || [], this.scheduler);
        this.scheduler.progress.toggle(cmd.progress);
        this.scheduler.set('cmdOptions', cmd);
        this.scheduler.set('wxaConfigs', this.wxaConfigs || {});
        this.scheduler.set('directiveBroker', this.directiveBroker);

        debug('builder wxaConfigs is %O', this.wxaConfigs);
        debug('schedule options is %O', this.scheduler);
        try {
            await this.handleEntry(cmd);
        } catch (error) {
            logger.error('编译入口参数有误', error);
            cmd.elog && cmd.elog.error('编译入口参数有误', error);
            throw error;
        }

        await this.run(cmd);

        logger.log('Tester E2E', `compile done. ${cmd.record ? 'Enabled' : 'Disabled'} record`);
        cmd.elog && cmd.elog.info('Tester E2E', `compile done. ${cmd.record ? 'Enabled' : 'Disabled'} record`);
        // console.log('E2ETester work done', cmd.record);

        // 要等wxa编译完不然会报错
        if (!cmd.record) {
            setTimeout(() => {
                runTestCase(cmd, this.wxaConfigs);
            }, 3000);
        }
    }


    async listen(cmdOptions) {
        let {port=9421, cliPath} = cmdOptions;
        if (cmdOptions.record) { // -r启动微信开发者工具
            runWechatTools(cmdOptions, this.wxaConfigs);
        }
        const used = await portUsed(port);
        if (used) return;
        let server = new Server({port}, logger, cmdOptions.elog);
        server.post(E2E_TEST_URL, async (data)=>{
            logger.info('Recieved Data: ', data);
            cmdOptions.elog && cmdOptions.elog.info('Recieved Data: ', data);
            if (!this.validFileName(data.name)) {
                cmdOptions.elog && cmdOptions.elog.error('用例名不合法');
                return logger.error('用例名不合法');
            }
            if (!data.record) {
                cmdOptions.elog && cmdOptions.elog.error('用例数据不能为空');
                return logger.error('用例数据不能为空');
            }
            if (!data.filePath) {
                cmdOptions.elog && cmdOptions.elog.error('目录路径不能为空');
                return logger.error('目录路径不能为空');
            }
            // 恢复原始路径
            let arr = data.filePath.split('/');
            arr = arr.map((item) => {
                if (item === '') return item;
                return `___${item}`;
            });
            const originPath = arr.join('/');
            // generate the record and save to project
            let clipath = {
                darwin: '/Contents/MacOS/cli',
                win32: '/cli.bat',
            };

            let cli = cliPath || path.join(this.wxaConfigs.wechatwebdevtools, clipath[process.platform]);

            try {
                // let recordString = await e2eRecord2js(data.record, {cliPath: cli, name: data.name});
                let outputPathBase = path.join(this.current, cmdOptions.outDir, originPath, data.name);
                let e2eRecordOutputPath = `${outputPathBase}/record.js`;
                let apiRecordOutputPath = `${outputPathBase}/api.json`;
                // save file;

                writeFile(e2eRecordOutputPath, `module.exports = ${JSON.stringify(data.record, null, 4)}`);
                writeFile(apiRecordOutputPath, JSON.stringify(data.apiRecord, null, 4));
            } catch (e) {
                logger.error('生成测试案例失败', e);
                cmdOptions.elog && cmdOptions.elog.error('生成测试案例失败', e);
            }
        });

        server.start();
    }

    validFileName(name) {
        // relative paths is not allowed.
        return /^[^\.]+[\w\/\.]*$/.test(name);
    }
}

export default class E2ETester {
    constructor(cmdOptions, wxaConfigs) {
        this.cmdOptions = cmdOptions;
        this.wxaConfigs = wxaConfigs;
    }

    async build() {
        console.log('e2e tester start');
        this.cmdOptions.elog && this.cmdOptions.elog.info('e2e tester start');
        let testerBuilder = new TesterBuilder(this.wxaConfigs, );
        
        await testerBuilder.build(this.cmdOptions);
        await testerBuilder.listen(this.cmdOptions);
    }
}
