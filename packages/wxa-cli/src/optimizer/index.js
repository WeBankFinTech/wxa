import path from 'path';
import debugPKG from 'debug';
import {AsyncSeriesHook} from 'tapable';
import ProgressBar from '../helpers/progressTextBar';

let debug = debugPKG('WXA:Optimizer');

export default class Optimizer {
    constructor(cwd, wxaConfigs, cmdOptions) {
        this.wxaConfigs = wxaConfigs;

        this.hooks = {
            optimizeAssets: new AsyncSeriesHook(['compilation']),
        };

        this.cmdOptions = cmdOptions;
        this.cwd = cwd;
        this.progress = new ProgressBar(cwd, wxaConfigs);
    }

    async do(dep) {
        const text = path.relative(this.cwd, dep.src);
        this.progress.draw(text, 'Optimizing', !this.cmdOptions.verbose);
        // if compile to mini-program, process.env will not available, so we have to replace it.
        if (this.wxaConfigs.target === 'wxa' && dep.code) {
            dep.code = dep.code.replace(/process\.env\.NODE_ENV/g, JSON.stringify(process.env.NODE_ENV));
        }

        if (dep.meta && dep.meta.source.indexOf(`node_modules${path.sep}`) !== -1) dep.code = this.hackNodeMoudule(dep.meta.source, dep.code);

        await this.hooks.optimizeAssets.promise(dep);
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
