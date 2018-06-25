import sass from 'node-sass';
import path from 'path';

class SassCompiler {
    constructor(cwd, compilers) {
        if (SassCompiler.prototype.instance) return SassCompiler.prototype.instance;
        SassCompiler.prototype.instance = this;

        this.current = cwd;
        this.configs = null;
        try {
            let pkg = require(path.join(this.current, 'package.json'));
            this.configs = pkg.sass;
        } catch (e) {
            this.configs = compilers.sass || {};
        }
        if(this.configs == null) this.configs = compilers.sass || {};
    }

    parse(content, configs, filepath) {
        return new Promise((resolve, reject)=>{
            sass.render({
                ...configs,
                data: content,
                file: filepath
            }, (err, res)=>{
                if (err) reject(err);
                else resolve(res.css.toString());
            });
        });
    }

    mount(map) {
        map['scss'] = this;
        map['sass'] = this;
        map['css'] = this;
        return map;
    }
}

export default SassCompiler;
