import {transform} from 'babel-core';
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

    parse(content, configs) {
        // console.info('compile with babel');
        if (configs == null) configs = this.configs;
        try {
            let rst = transform(content, configs);
            return Promise.resolve(rst);
        } catch (e) {
            return Promise.reject(e);
        }
    }

    mount(map) {
        map['js'] = this;
        return map;
    }
}

export default BabelCompiler;
