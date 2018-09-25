import {transform, transformFile} from '@babel/core';
import fs from 'fs';
import path from 'path';
import debugPKG from 'debug';

let debug = debugPKG('WXA:BABEL_Loader')

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

        let {src, code} = mdl;

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
                let ret = await this.transform(type, code || src, {
                    ...configs,
                    filename: opath.base
                });

                mdl.code = ret.code;
                mdl.sourceMap = ret.map;

                debug('transform succ %s', ret.code);
                return Promise.resolve({ret, code: ret.code, compileTo: 'js'});
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

    mount(map) {
        map['js'] = this;
        return map;
    }
}

export default BabelLoader;
