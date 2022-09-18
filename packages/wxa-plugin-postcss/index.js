const postcss = require('postcss');
const path = require('path');
const fs = require('fs');
const compat = require('./postcss-wildcard-to-page');


let outDeps;

module.exports = class PostcssPlugin {
    constructor(options = {}) {
        this.configs = Object.assign({}, {
            test: /\.css$|\.wxss$/,
            plugins: [],
            tailwind: compat
        }, options);
    }
    apply(compiler) {
        if (compiler.hooks == null) return;
        // console.log(compiler)

        if (this.configs.tailwind && compiler.hooks.beforeRun) {
            compiler.hooks.beforeRun.tapAsync('PostcssTailwindCompat', (compiler, next) => {
                // console.log(outDeps);
                if (outDeps) return next(null);
                
                let jsonPath = compiler.appJSON;
                let temp = path.parse(jsonPath);
                let wxssPath = path.join(temp.dir, temp.name+'.wxss');
                let cssPath = path.join(temp.dir, temp.name+'.css');
                let appWxa = path.join(temp.dir, temp.name+'.wxa');
                [wxssPath, cssPath].forEach((file) => {
                    // console.log(file, fs.existsSync(file))
                    if(fs.existsSync(file)) {
                        if (Array.isArray(outDeps)) outDeps.push(file);
                        else outDeps = [file];
                    };
                });

                if (fs.existsSync(appWxa) && !Array.isArray(outDeps)) outDeps = [cssPath];

                next(null);
            })
        };

        if (compiler.hooks.optimizeAssets) {
            compiler.hooks.optimizeAssets.tapAsync('PostcssPlugin', (compilation, next) => {
                // console.log(compilation?.meta?.source);
                // console.log(compilation?.meta?.source);
                // console.log(compilation);
                // enable tailwind
                if (
                    this.configs.tailwind && 
                    compilation.meta && 
                    /\.wxml$/.test(compilation.meta.source) && 
                    Array.isArray(outDeps)
                ) {
                    outDeps.forEach((dep) => {
                        // console.log('postcss', compilation)
                        if (compilation.reference) {
                            for (let node of compilation.reference.values()){
                                if (node.isAbstract) node.dependency(dep);
                                // console.log(node.outerDependencies)
                            } 
                        }
                        compilation.dependency(dep, compilation);
                    });
                }
    
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
    }
    run(compilation, next) {
        const plugins = this.configs.plugins.slice(0);
        if (this.configs.tailwind) plugins.push(this.configs.tailwind);

        postcss(plugins)
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