import path from 'path';
import debugPKG from 'debug';
import {AsyncSeriesHook} from 'tapable';

let debug = debugPKG('WXA:Optimizer');

export default class Optimizer {
    constructor(resolve, meta) {
        debug('optimizer constructor, %o %o ', resolve, meta);
        this.meta = meta;
        this.resolve = resolve;

        this.hooks = {
            optimizeAssets: new AsyncSeriesHook(['compilation']),
        };
    }

    do(dep) {
        if (dep.pret && dep.pret.isNodeModule) dep.code = this.hackNodeMoudule(dep.meta.source, dep.code);

        return this.hooks.optimizeAssets.promise(dep);
    }

    hackNodeMoudule(filepath, code) {
        let opath = path.parse(filepath);
        // inspired by wepy
        code = code.replace(/process\.env\.NODE_ENV/g, JSON.stringify(process.env.NODE_ENV));
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
