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
        return this.hooks.optimizeAssets.promise(dep);
    }
}
