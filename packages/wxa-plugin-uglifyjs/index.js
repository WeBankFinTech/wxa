const uglify = require('uglify-js');
const fs = require('fs');
const path = require('path');

module.exports = class UglifyjsPlugins {
    constructor(options = {}) {
        this.configs = Object.assign({}, {
            test: /(\.)?js$|script$/,
            ignore: ["node_modules"],
            uglifyjsOptions: {}
        }, options);
    }
    apply(compiler) {
        compiler.hooks.optimizeAssets.tapAsync('uglifyjsPlugin', (opath, compilation, next) => {
            this.run(compilation, opath, next);
        });
    }
    run(compilation, opath, next) {
        if(!this.configs.test.test(compilation.$sourceType||compilation.ext)) return next(null);

        if (this.checkIgnore(opath, this.configs.ignore)) return next(null);

        let rst = uglify.minify(compilation.code, this.configs.uglifyjsOptions);
        if (rst.error) {
            let p = path.join(process.cwd(), '.wxa-plugin-uglifyjs.debog.log');
            let logFile = fs.createWriteStream(p, {flags: 'a'});
            logFile.write('\n'+new Date()+'\n');
            logFile.write('ERROR IN: ' + path.join(opath.dir, opath.base));
            logFile.write('\n');
            logFile.write('Message: ' + rst.error.message);
            logFile.write('\n');
            logFile.write('CODE: \n' +compilation.code);
            logFile.write('\n');

            next(rst.error);
        }

        compilation.code = rst.code;
        next(null);
    }

    checkIgnore(opath, ignore) {
        if(ignore == null) return false;
        let filepath = normal(opath.dir + path.sep + opath.base);

        if (Array.isArray(ignore)) {
            return ignore.some((str)=>{
                let reg = typeof str === 'object' ? str : new RegExp(str);

                return reg.test(filepath);
            });
        } else {
            let reg = typeof ignore === 'object' ? ignore : new RegExp(ignore);

            return reg.test(filepath);
        }
    }

    normal(path) {
        return path.replace(/\\/g, '/');
    }
}