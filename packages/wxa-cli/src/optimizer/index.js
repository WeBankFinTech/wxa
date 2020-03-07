import path from 'path';
import debugPKG from 'debug';
import {AsyncSeriesHook} from 'tapable';
import ProgressBar from '../helpers/progressTextBar';
import SplitDeps from './splitDeps';
import types from '../const/types';
import {stuffEmptyAttributs} from './stuffEmptyAttributes';
import transformPixelsToRpx from './pxtorpx';

let debug = debugPKG('WXA:Optimizer');

export default class Optimizer {
    constructor({cwd, wxaConfigs, cmdOptions, appConfigs}) {
        this.wxaConfigs = wxaConfigs;

        this.hooks = {
            optimizeAssets: new AsyncSeriesHook(['compilation']),
        };

        this.cmdOptions = cmdOptions;
        this.cwd = cwd;
        this.progress = new ProgressBar(cwd, wxaConfigs);
        this.splitDeps = new SplitDeps({appConfigs, wxaConfigs, cwd, cmdOptions});
    }

    async run(indexedMap, appConfigs) {
        let optimizeTasks = [];

        indexedMap.forEach((dep)=>{
            let task = async ()=>{
                await this.do(dep, appConfigs, indexedMap);
            };

            optimizeTasks.push(task());
        });

        await Promise.all(optimizeTasks);


        if (!this.cmdOptions.watch) this.splitDeps.run(indexedMap);
    }

    async do(dep, indexedMap) {
        if (!dep.src) {
            // deadcode normally
            debugger;
            return;
        }

        const text = path.relative(this.cwd, dep.src);
        this.progress.draw(text, 'Optimizing', !this.cmdOptions.verbose);

        if (~types.WECHAT.concat(types.TT).indexOf(this.wxaConfigs.target)) {
            this.doWxaOptimize(dep, indexedMap);
        }

        // stuff xml empty Attributes
        if (
            this.wxaConfigs.optimization.allowEmptyAttributes &&
            ~['xml', 'wxml'].indexOf(dep.kind)
        ) {
            stuffEmptyAttributs(dep);
        }

        if (
            ~['css'].indexOf(dep.kind) &&
            this.wxaConfigs.optimization.transformPxToRpx
        ) {
            transformPixelsToRpx(dep, this.wxaConfigs);
        }

        await this.hooks.optimizeAssets.promise(dep);
    }

    doWxaOptimize(dep, indexedMap) {
        // if compile to mini-program, process.env will not available, so we have to replace it.
        if (dep.code) {
            dep.code = dep.code.replace(/process\.env\.NODE_ENV/g, JSON.stringify(process.env.NODE_ENV));
        };

        if (dep.meta && dep.meta.source.indexOf(`node_modules${path.sep}`) !== -1) {
            dep.code = this.hackNodeMoudule(dep.meta.source, dep.code);
        }
    }

    hackNodeMoudule(filepath, code) {
        let opath = path.parse(filepath);
        // inspired by wepy
        switch (opath.base) {
            case 'lodash.js':
            case '_root.js':
            case '_global.js':
                code = code.replace('Function(\'return this\')()', 'this');
                break;
            case '_html.js':
                code = 'module.exports = false;';
                break;
            case '_microtask.js':
                code = code.replace('if(Observer)', 'if(false && Observer)');
                // IOS 1.10.2 Promise BUG
                code = code.replace('Promise && Promise.resolve', 'false && Promise && Promise.resolve');
                break;
            // 并没有好的方法找到全局变量，top, self, this, window, global都不能解决三端问题, 只好采用https://cnodejs.org/topic/5846b2883ebad99b336b1e06的方式解决问题了。
            case '_freeGlobal.js':
                code = code.replace('module.exports = freeGlobal;', `module.exports = {
                    Promise: Promise,
                    Array: Array,
                    Date: Date,
                    Error: Error,
                    Function: Function,
                    Math: Math,
                    Object: Object,
                    RegExp: RegExp,
                    String: String,
                    TypeError: TypeError,
                    setTimeout: setTimeout,
                    clearTimeout: clearTimeout,
                    setInterval: setInterval,
                    clearInterval: clearInterval
                  };
                `);
        }
        return code;
    }
}
