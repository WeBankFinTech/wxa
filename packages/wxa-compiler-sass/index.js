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

    mount(map) {
        map['scss'] = this;
        map['sass'] = this;
        return map;
    }
}

export default SassCompiler;
