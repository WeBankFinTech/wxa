import sass from 'node-sass';
import path from 'path';
import debugPKG from 'debug'

let debug = debugPKG('WXA:SASS-Loader')
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

    async parse(mdl, cmdConfigs) {
        debug('sass module parse started %O', mdl);

        let configs  = this.configs;

        let ret = await this.render(mdl.content || null, mdl.meta.source, configs);
        
        mdl.code = ret.css.toString();

        // custom outputPath
        if(mdl.meta) {
            let source = path.parse(mdl.meta.source);
            mdl.meta.source = source.dir + path.sep + source.name + '.css';

            let output = path.parse(mdl.meta.outputPath);
            mdl.meta.outputPath = output.dir + path.sep + output.name + '.css'
        }

        return {ret, code: mdl.code};
    }

    render(data, filepath, configs) {
        return new Promise((resolve, reject)=>{
            sass.render({
                ...configs,
                data,
                file: filepath
            }, (err, ret)=>{
                if(err) return reject(err);

                return resolve(ret);
            })
        })
    }
}

export default SassCompiler;
