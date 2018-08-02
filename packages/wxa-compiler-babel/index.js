import {transformSync} from 'babel-core';
import fs from 'fs';
import path from 'path';

class BabelCompiler {
    constructor(cwd, configs) {
        if (BabelCompiler.prototype.instance) return BabelCompiler.prototype.instance;
        BabelCompiler.prototype.instance = this;
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

    parse(content, configs, opath) {
        if (configs == null) configs = this.configs;
        if(opath && this.checkIgnore(opath, configs.ignore)) {
            return Promise.resolve(content);
        } else {
            try {
                let rst = transformSync(content, {
                    ...configs,
                    filename: opath.base
                });
                return Promise.resolve(rst);
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

export default BabelCompiler;
