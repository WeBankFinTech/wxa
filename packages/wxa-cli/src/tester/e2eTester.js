import Builder from '../Builder';
import Schedule from '../schedule.js';
import Compiler from '../compilers/index';
import domWalker from './domWalker.js';

import crypto from 'crypto';
import debugPKG from 'debug';
import fs from 'fs';
import path from 'path';
import logger from '../helpers/logger';
import simplify from '../helpers/simplifyObj';
import {applyPlugins, readFile} from '../utils.js';
import COLOR from '../const/color';

const debug = debugPKG('WXA:E2ETester');
const E2E_TEST_COMPONENT = 'wxa-e2e-record-btn';
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
            let appConfigs = JSON.parse(mdl.code);

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

        this.schedule = new TesterScheduler(this.loader);
        applyPlugins(this.wxaConfigs.plugins || [], this.schedule);
        this.schedule.progress.toggle(cmd.progress);
        this.schedule.set('cmdOptions', cmd);
        this.schedule.set('wxaConfigs', this.wxaConfigs || {});

        debug('builder wxaConfigs is %O', this.wxaConfigs);
        debug('schedule options is %O', this.schedule);
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
}

export default class E2ETester {
    constructor(cmdOptions, wxaConfigs) {
        this.cmdOptions = cmdOptions;
        this.wxaConfigs = wxaConfigs;
    }

    build() {
        console.log('e2e tester start');
        new TesterBuilder(this.wxaConfigs).build(this.cmdOptions);
    }
}
