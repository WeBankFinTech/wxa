const uglify = require('uglify-js');
const fs = require('fs');
const path = require('path');
const defaultOpt = {}
module.exports = class UglifyjsPlugins {
    constructor(options = {}) {
        this.configs = Object.assign({}, {
            filter: /\.js$/,
            config: defaultOpt
        }, options);
        this.count = 0;
    }
    apply(compiler) {
        compiler.hooks.optimizeAssets.tapAsync('optimize-assets', (code, compilation, next) => {
            this.run(compilation, code, next);
        });
    }
    run(compilation, code, next) {
        if(!this.configs.filter.test(compilation.type)) return next(null);
        let rst = uglify.minify(code, this.configs.config);
        if(rst.error) next(rst.error);

        compilation.code = rst.code;
        next(null);
    }
}