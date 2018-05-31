const uglify = require('uglify-js');
const fs = require('fs');
const path = require('path');
const defaultOpt = {}
module.exports = class UglifyjsPlugins {
    constructor(options = {}) {
        this.configs = Object.assign({}, {
            filter: /(\.)?js$/,
            config: defaultOpt
        }, options);
    }
    apply(compiler) {
        compiler.hooks.optimizeAssets.tapAsync('uglifyjsPlugin', (code, compilation, next) => {
            this.run(compilation, compilation.code, next);
        });
    }
    run(compilation, code, next) {
        if(!this.configs.filter.test(compilation.ext)) return next(null);
        let rst = uglify.minify(code, this.configs.config);
        if(rst.error) next(rst.error);

        compilation.code = rst.code;
        next(null);
    }
}