import stylus from 'stylus';
import path from 'path';

class StylusCompiler {
    constructor(cwd, configs) {
        // default match file path.
        this.test = /\.stylus|\.styl/;

        this.current = cwd;
        this.configs = null;
        try {
            let pkg = require(path.join(this.current, 'package.json'));
            this.configs = pkg.stylus;
        } catch (e) {
            this.configs = configs || {};
        }
        if(this.configs == null) this.configs = configs || {};
    }

    parse(mdl, cmdConfigs) {
        return new Promise((resolve, reject)=>{
            let opath = path.parse(mdl.src);
            let cfg = {
                ...this.configs,
                filename: opath.base,
                paths: [opath.dir]
            };

            stylus.render(mdl.content, cfg, (err, res)=>{
                if (err) return reject(err);

                // custom outputPath
                if(mdl.meta) {
                    let source = path.parse(mdl.meta.source);
                    mdl.meta.source = source.dir + path.sep + source.name + '.css';

                    let output = path.parse(mdl.meta.outputPath);
                    mdl.meta.outputPath = output.dir + path.sep + output.name + '.css'
                }

                resolve(res);
            });
        });
    }
}

export default StylusCompiler;
