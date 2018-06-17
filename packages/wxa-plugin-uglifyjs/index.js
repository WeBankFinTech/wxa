const uglify = require('uglify-js');
const fs = require('fs');
const path = require('path');

module.exports = class UglifyjsPlugins {
    constructor(options = {}) {
        this.configs = Object.assign({}, {
            test: /(\.)?js|script$/,
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

        let rst = uglify.minify(compilation.code, this.configs.uglifyjsOptions);
        if(rst.error) next(rst.error);

        compilation.code = rst.code;
        next(null);
    }
}