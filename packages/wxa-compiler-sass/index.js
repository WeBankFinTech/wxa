import sass from 'node-sass';
import path from 'path';
import debugPKG from 'debug'

let debug = debugPKG('WXA:SASS-Loader')
class SassCompiler {
    constructor(cwd, configs) {
        // default match file path.
        this.test = /\.sass|\.scss/;

        this.current = cwd;
        this.configs = null;
        try {
            let pkg = require(path.join(this.current, 'package.json'));
            this.configs = pkg.sass || pkg.scss;
        } catch (e) {
            this.configs = configs || {};
        }
        if(this.configs == null) this.configs = configs || {};
    }

    async parse(mdl, cmdOptions, compilation) {
        debug('sass module parse started %O', mdl);
        // custom outputPath
        if(mdl.meta) {
            let source = path.parse(mdl.meta.source);
            mdl.meta.source = source.dir + path.sep + source.name + '.css';

            let output = path.parse(mdl.meta.outputPath);
            mdl.meta.outputPath = output.dir + path.sep + output.name + '.css'
        }

        let configs  = this.configs;

        if (cmdOptions && cmdOptions.sourceMap) {
            // inline css sourcemap.
            configs.sourceMap = cmdOptions.sourceMap;
            configs.sourceMapEmbed = true;
        }

        let ret = await this.render(mdl.content || null, mdl.meta.source, configs);
        
        mdl.code = ret.css.toString();
        // 向下兼容
        if (ret.stats.includedFiles.length && compilation) {
            ret.stats.includedFiles.forEach((file)=>{
                mdl.dependency(file, compilation);
            });
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
