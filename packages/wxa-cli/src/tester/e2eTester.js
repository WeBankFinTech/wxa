import Builder from '../Builder';
import Schedule from '../schedule.js';
import Compiler from '../compilers/index';
import domWalker from './domWalker.js';
import Server from './server.js';
import e2eRecord2js from './wxa-e2eTest/e2eRecord2js';
import logger from '../helpers/logger';
import simplify from '../helpers/simplifyObj';
import {applyPlugins, readFile, writeFile} from '../utils.js';
import COLOR from '../const/color';
import {DirectiveBroker} from '../directive/directiveBroker';
import crypto from 'crypto';
import debugPKG from 'debug';
import path from 'path';
import mkdirp from 'mkdirp';

const debug = debugPKG('WXA:E2ETester');
const E2E_TEST_COMPONENT = 'wxa-e2e-record-btn';
const E2E_TEST_URL = '/record';

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
            this.perf.markStart(relativeSrc);
            this.hooks.buildModule.call(dep);

            // loader: use custom compiler to load resource.
            await this.loader.compile(dep, this);

            this.perf.markEnd(relativeSrc);

            // Inject test suite into app.js
            if (dep.meta && dep.meta.source === this.APP_SCRIPT_PATH) {
                this.tryWrapWXATestSuite(dep);
            }
            if (dep.meta && dep.meta.source === this.APP_CONFIG_PATH) {
                this.tryAddGlobalTestComponent(dep);
            }

            // try to wrap wxa every app and page
            this.tryWrapWXA(dep);
            this.tryAddPolyfill(dep);

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

            if (dep.kind === 'xml') {
                await domWalker(dep, this);
            }

            if (dep.category === 'Page' && dep.kind === 'xml') {
                this.tryAddTestComponent(dep);
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

    tryWrapWXATestSuite(mdl) {
        if (
            ~['app'].indexOf(mdl.category ? mdl.category.toLowerCase() : '') &&
            mdl.meta && path.extname(mdl.meta.source) === '.js' &&
            (/exports\.default/gm.test(mdl.code) || /exports\[["']default["']/gm.test(mdl.code))
        ) {
            mdl.code = `
                let $$testSuitePlugin = require('wxa://wxa-e2eTest/e2eTestSuite.js');
                require('@wxa/core').wxa.use($$testSuitePlugin);
                ${mdl.code}
            `;
        }
    }

    tryAddGlobalTestComponent(mdl) {
        try {
            let appConfigs = JSON.parse(mdl.content);

            appConfigs['wxa.globalComponents'] = {
                ...appConfigs['wxa.globalComponents'],
                [E2E_TEST_COMPONENT]: 'wxa://wxa-e2eTest/e2eRecordBtn',
            };

            mdl.code = JSON.stringify(appConfigs);
        } catch (e) {
            logger.warn('wrap global test component fail', e);
        }
    }

    tryAddTestComponent(mdl) {
        mdl.code = (mdl.code || '') + `<${E2E_TEST_COMPONENT}></${E2E_TEST_COMPONENT}>`;
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
            throw error;
        }

        await this.run(cmd);

        console.log('E2ETester work done');

        // if (cmd.watch) this.watch(cmd);
    }

    listen(cmdOptions) {
        let {port=9421, cliPath} = cmdOptions;
        let server = new Server({port}, logger);
        server.post(E2E_TEST_URL, async (data)=>{
            logger.info('Recieved Data: ', data);
            if (!this.validFileName(data.name)) return logger.error('用例名不合法');
            if (!data.record) return logger.error('用例数据不能为空');
            // generate the record and save to project
            let clipath = {
                darwin: '/Contents/Resources/app.nw/bin/cli',
                win32: '/cli.bat',
            };

            let cli = cliPath || path.join(this.wxaConfigs.wechatwebdevtools, clipath[process.platform]);

            try {
                let recordString = await e2eRecord2js(data.record, {cliPath: cli, name: data.name});

                let outputPath = path.join(this.current, cmdOptions.outDir, data.name+'.test.js');
                // save file;
                writeFile(outputPath, recordString);
            } catch (e) {
                logger.error('生成测试案例失败', e);
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

    build() {
        console.log('e2e tester start');
        let testerBuilder = new TesterBuilder(this.wxaConfigs, );

        testerBuilder.build(this.cmdOptions);
        testerBuilder.listen(this.cmdOptions);
    }
}