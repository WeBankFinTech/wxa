import stylus from 'stylus';
import path from 'path';

class StylusCompiler {
    constructor(cwd, compilers) {
        if (StylusCompiler.prototype.instance) return StylusCompiler.prototype.instance;
        StylusCompiler.prototype.instance = this;

        this.current = cwd;
        this.configs = null;
        try {
            let pkg = require(path.join(this.current, 'package.json'));
            this.configs = pkg.stylus;
        } catch (e) {
            this.configs = compilers.stylus || {};
        }
        if(this.configs == null) this.configs = compilers.stylus || {};
    }

    parse(content, configs, filepath) {
        return new Promise((resolve, reject)=>{
            let opath = path.parse(filepath);
            let cfg = {
                ...configs,
                filename: opath.base,
                paths: [opath.dir]
            };
            stylus.render(content, cfg, (err, res)=>{
                if (err) reject(err);
                else resolve(res);
            });
        });
    }

    mount(map) {
        map['stylus'] = this;
        map['styl'] = this;
        return map;
    }
}

export default StylusCompiler;
