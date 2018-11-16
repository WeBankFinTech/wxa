const postcss = require('postcss');
const path = require('path');

module.exports = class PostcssPlugin {
    constructor(options = {}) {
        this.configs = Object.assign({}, {
            test: /\.css$|\.wxss$/,
            plugins: []
        }, options);
    }
    apply(compiler) {
        if (compiler.hooks == null || compiler.hooks.optimizeAssets == null) return;

        compiler.hooks.optimizeAssets.tapAsync('PostcssPlugin', (compilation, next) => {
            if (
                compilation.meta &&
                this.configs.test.test(compilation.meta.source)
            ) {
                this.run(compilation, next);
            } else {
                next();
            }
        });
    }
    run(compilation, next) {
        postcss(this.configs.plugins)
        .process(compilation.code, {from: compilation.src})
        .then((succ)=>{
            if(succ.error) next(succ.error);

            compilation.code = succ.css;

            next(null);
        }, (fail)=>{
            next(fail);
        })
    }
}