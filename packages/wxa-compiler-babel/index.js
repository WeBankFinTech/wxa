import {transform, transformFile} from '@babel/core';
import fs from 'fs';
import path from 'path';
import debugPKG from 'debug';
import cache from './fs-cache';

let debug = debugPKG('WXA:BABEL_Loader');

let pkg = require('./package.json');

function readFile(p) {
    let rst = '';
    p = (typeof p === 'object') ? path.join(p.dir, p.base) : p;
    try {
        rst = fs.readFileSync(p, 'utf-8');
    } catch (e) {
        rst = null;
    }

    return rst;
}

function amazingCache(params, needCache) {
    let defaultOpts = {
        directory: true,
        identifier: JSON.stringify({
            '@webank/wxa-compiler-babel': pkg.version,
            'env': process.env.NODE_ENV || 'development',
        }),
    };
    let cacheParams = Object.assign(
        {},
        defaultOpts,
        params,
    );

    if (needCache) {
        return cache(cacheParams);
    } else {
        let {source, transform, options} = cacheParams;
        return transform(source, options);
    }
}

class BabelLoader {
    constructor(cwd, configs) {
        this.current = cwd;
        // get configuration from .babelrc, package.json or wxa.config.js
        this.configs = null;
        try {
            let babelrc = JSON.parse(fs.readFileSync(path.join(this.current, '.babelrc'), 'utf-8'));
            this.configs = babelrc;
        } catch (e) {
            let pkg = require(path.join(this.current, 'package.json'));
            this.configs = pkg.babel || null;
        }

        if (this.configs == null) this.configs = configs.babel || {};

        this.configs.ignore = this.configs.ignore || ["node_modules"];
    }

    transform(type, ...args) {
        let map = new Map([['transform', transform], ['transformFile', transformFile]]);
        // console.log(map.get(type))

        return new Promise((resolve, reject)=>{
            debug('arguments %O', args)
            map.get(type).call(null, ...args, function(err, result){
                if(err) reject(err);

                resolve(result)
            });
        })
    }


    async parse(mdl, cmdOptions) {
        debug('transform started %O', mdl);

        let {meta: {source: src}, content: code} = mdl;

        let configs = this.configs;
        let type = 'transform';
        let opath = path.parse(src);

        if(code == null) {
            type = 'transformFile';
        }

        if(opath && this.checkIgnore(opath, configs.ignore)) {
            return Promise.resolve({code});
        } else {
            try {

                let ret = await amazingCache({
                    source: code || readFile(src),
                    options: {
                        ...configs, 
                        filename: opath.base
                    },
                    transform: ()=>{
                        return this.transform(type, code || src, {
                            ...configs,
                            filename: opath.base
                        });
                    }
                }, cmdOptions.cache);

                debug('transform succ %s', ret.code);
                return Promise.resolve({ret, code: ret.code});
            } catch (e) {
                return Promise.reject(e);
            }
        }
    }

    checkIgnore(opath, ignore) {
        if(ignore == null) return false;
        let filepath = this.normal(opath.dir + path.sep + opath.base);

        if (Array.isArray(ignore)) {
            return ignore.some((str)=>{
                let reg = typeof str === 'object' ? str : new RegExp(str);

                return reg.test(filepath);
            });
        } else {
            let reg = typeof ignore === 'object' ? ignore : new RegExp(ignore);

            return reg.test(filepath);
        }
    }

    normal(path) {
        return path.replace(/\\/g, '/');
    }

}

export default BabelLoader;
