const less = require('less');
const path = require('path');

class LessCompiler {
    constructor(cwd, configs) {
        // default match file path.
        this.test = /\.less/;

        this.current = cwd;
        this.configs = null;
        try {
            let pkg = require(path.join(this.current, 'package.json'));
            this.configs = pkg.less;
        } catch (e) {
            this.configs = configs || {};
        }
        if(this.configs == null) this.configs = configs || {};
    }

    async parse(mdl, cmdOptions, compilation) {
        // custom outputPath
        if (mdl.meta) {
            let source = path.parse(mdl.meta.source);
            mdl.meta.source = source.dir + path.sep + source.name + '.css';

            let output = path.parse(mdl.meta.outputPath);
            mdl.meta.outputPath = output.dir + path.sep + output.name + '.css'
        }

        let configs  = this.configs;

        if (cmdOptions && cmdOptions.sourceMap) {
            // inline css sourcemap.
            configs.sourceMap = configs.sourceMap || {}
            configs.sourceMap.sourceMapFileInline = true;
        }

        let ret = await this.render(mdl.content || null, mdl.meta.source, configs);
        
        mdl.code = ret.css;
        // 向下兼容
        if (ret.imports.length && compilation) {
            ret.imports.forEach((file)=>{
                mdl.dependency(path.join(this.currrent, file), compilation);
            });
        }

        return {ret, code: mdl.code};
    }

    render(file, filepath, configs) {
        return less.render(file, {
            paths: filepath,
            ...configs,
        })
    }
}

module.exports = LessCompiler;
