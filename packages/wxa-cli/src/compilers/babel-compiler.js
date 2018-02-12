import {transform} from 'babel-core';
import {readFile, getConfig} from '../utils';
import path from 'path';

class BabelCompiler {
    constructor(cwd) {
        this.current = cwd;
        // get configuration from .babelrc, package.json or wxa.config.js
        this.configs = null;
        try {
            let babelrc = JSON.parse(readFile(path.join(this.current, '.babelrc')));
            this.configs = babelrc;
        } catch (e) {
            let pkg = require(path.join(this.current, 'package.json'));
            this.configs = pkg.babel || null;
        }

        if (this.configs == null) this.configs = getConfig().compilers.babel;
    }

    parse(content, configs) {
        console.info('compile with babel');
        if (configs == null) configs = this.configs;
        try {
            let rst = transform(content, configs);
            return Promise.resolve(rst);
        } catch (e) {
            return Promise.reject(e);
        }
    }
}

export default BabelCompiler;
