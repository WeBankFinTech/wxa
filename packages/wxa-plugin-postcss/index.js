const postcss = require('postcss');
const path = require('path');

module.exports = class PostcssPlugin {
    constructor(options = {}) {
        this.configs = Object.assign({}, {
            test: /style/,
            plugins: []
        }, options);
    }
    apply(compiler) {
        compiler.hooks.optimizeAssets.tapAsync('PostcssPlugin', (opath, compilation, next) => {
            this.run(compilation, opath, next);
        });
    }
    run(compilation, opath, next) {
        if(!this.configs.test.test(compilation.$sourceType)) return next(null);

        postcss(this.configs.plugins)
        .process(compilation.code, {from: opath.dir+path.sep+opath.base})
        .then((succ)=>{
            if(succ.error) next(succ.error);

            compilation.code = succ.css;

            next(null);
        }, (fail)=>{
            next(fail);
        })
    }
}