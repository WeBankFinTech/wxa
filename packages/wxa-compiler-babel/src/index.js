import {transform, transformFile} from '@babel/core';
import fs from 'fs';
import path from 'path';
import debugPKG from 'debug';
import cache from './fs-cache';

let debug = debugPKG('WXA:BABEL_Loader');

let pkg = require('../package.json');

function readFile(p) {
    p = (typeof p === 'object') ? path.join(p.dir, p.base) : p;

    return fs.readFileSync(p, 'utf-8');
}

function amazingCache(params, needCache) {
    let defaultOpts = {
        directory: true,
        identifier: JSON.stringify({
            '@wxa/compiler-babel': pkg.version,
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
        // default match file path.
        this.test = /\.js$|\.wxs$/;

        this.current = cwd;
        // get configuration from .babelrc, package.json or wxa.config.js
        // find .babelrc first then babel.config.js
        let babelrc = path.join(this.current, '.babelrc');
        let babeljs = path.join(this.current, 'babel.config.js');
        let pkg = path.join(this.current, 'package.json');

        if (fs.existsSync(babelrc)) {
            this.configs = JSON.parse(fs.readFileSync(babelrc, 'utf-8'));
        } else if (fs.existsSync(babeljs)){
            this.configs = require(babeljs);
        } else if (fs.existsSync(pkg)){
            this.configs = require(pkg).babel;
        } 

        // setup default babel config
        this.configs = this.configs || configs || {};
        // process ignore to compat babel6
        if (
            typeof this.configs.ignore === 'string' || 
            this.configs.ignore instanceof RegExp
        ) {
            this.configs.ignore = [this.configs.ignore];
        } else if ( 
            this.configs.ignore && 
            !Array.isArray(this.configs.ignore)
        ) {
            throw new Error(`babel 配置 ignore 必须为Array类型`);
        } else {
            this.configs.ignore = this.configs.ignore || ["node_modules"];
        }
    }

    transform(type, ...args) {
        let map = new Map([['transform', transform], ['transformFile', transformFile]]);

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

        if(this.checkIgnore(opath, configs.ignore) || code === '') {
            return Promise.resolve({code});
        } else {
            let ret = await amazingCache({
                source: code || readFile(src),
                options: {
                    ...configs, 
                    filename: src
                },
                transform: ()=>{
                    return this.transform(type, code || src, {
                        ...configs,
                        filename: src,
                    });
                }
            }, cmdOptions.cache);

            debug('transform succ %s', ret.code);
            return Promise.resolve({ret, code: ret.code, sourceMap: ret.map});
        }
    }

    checkIgnore(opath, ignore) {
        if(ignore == null) return false;
        let filepath = this.normal(opath.dir + path.sep + opath.base);

        return ignore.some((str)=>{
            let reg = typeof str === 'object' ? str : new RegExp(str);

            return reg.test(filepath);
        });
    }

    normal(path) {
        return path.replace(/\\/g, '/');
    }

}

export default BabelLoader;
