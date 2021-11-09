import sass from 'sass';
import path from 'path';
import fs from 'fs';
// import Fiber from 'fibers';
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
        // console.log('/n')
        // console.log(filepath, configs)
        return new Promise((resolve, reject)=>{
            let ret = sass.renderSync({
                ...configs,
                data,
                file: filepath,
                // filber: Fiber,
                // includePaths: [filepath],
                // importer(url, prev, done) {
                //     // debugger;
                //     let file = path.resolve(path.dirname(prev), url);
                //     let ext = path.extname('url')

                //     if (ext === '.wxss') {
                //         done({
                //             contents: fs.readFileSync(file)
                //         })
                //     } 

                //     return file;
                // }
            })
            debugger;
            return resolve(ret);
        })
    }
}

export default SassCompiler;
