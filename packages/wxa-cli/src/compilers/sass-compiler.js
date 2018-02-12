import sass from 'node-sass';
import path from 'path';
import {getConfig} from '../utils';

class SassCompiler {
    constructor(cwd, filepath) {
        this.current = cwd;
        this.configs = null;
        try {
            let pkg = require(path.join(this.current, 'package.json'));
            this.configs = pkg.sass;
        } catch (e) {
            this.configs = getConfig().compilers.sass || {};
        }
    }

    parse(content, configs) {
        return new Promise((resolve, reject)=>{
            sass.render({
                ...configs,
                data: content,
            }, (err, res)=>{
                if (err) reject(err);
                else resolve(res.css.toString());
            });
        });
    }
}

export default SassCompiler;
