import {transform, transformFile} from '@babel/core';
import fs from 'fs';
import path from 'path';
import debugPKG from 'debug';
import cache from './fs-cache';
import workerFarm from 'worker-farm';

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

const FARM_OPTIONS = {
    maxConcurrentWorkers        : require('os').cpus().length,
    maxCallsPerWorker           : Infinity,
    maxConcurrentCallsPerWorker : 1
};

class BabelLoader {
    constructor(cwd, configs) {
        // console.log('configs', configs);
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
        configs = configs || {};
        this.enableConcurrent = Boolean(configs.concurrent);
        let farmOptions = {
            ...FARM_OPTIONS,
            ...configs.farmOptions, 
        }
        this.babelWorker = workerFarm(farmOptions, require.resolve('./babel-compile'));
        this.configs.sourceMap = configs.sourceMap
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

    transform({type, code, src, options}) {
        let map = new Map([['transform', transform], ['transformFile', transformFile]]);

        return new Promise((resolve, reject)=>{
            // debug('arguments %O', args)
            map.get(type).call(null, code || src, options, function(err, result){
                if(err) reject(err);

                resolve(result)
            });
        })
    }

    workerTransform({type, code, src, options: {filename, ...configs}}) {
        return new Promise((resolve, reject) => {
            this.babelWorker({
                type, 
                source: code || src, 
                options: {
                    ...configs,
                    filename,
                }
            }, (err, ret) => {
                if (err) return reject(err);
                
                resolve(ret)
            })
        })
    }

    async parse(mdl, cmdOptions) {
        // console.log('counter', counter, timer);
        debug('transform started %O', mdl);
        let i = Date.now();

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
            let options = {
                ...configs, 
                filename: src,
            }

            if(mdl.sourceMap){
                options.inputSourceMap = mdl.sourceMap
            }

            let ret = await amazingCache({
                source: code || readFile(src),
                options,
                transform: ()=>{
                    let param = {type, code, src, options};
                    return this.enableConcurrent ? this.workerTransform(param) : this.transform(param);
                }
            }, cmdOptions.cache);

            // timer += Date.now() - i;

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

    destroy() {
        workerFarm.end(this.babelWorker);
    }
}

export default BabelLoader;
