module.exports = class ReplacePlugin {
    constructor(options={}) {
        this.configs = Object.assign({}, options);
    }   
    apply(compiler) {
        compiler.hooks.optimizeAssets.tapAsync('replacePlugin', (code, compilation, next)=>{
            this.run(code, compilation, next);
        })
    }
    run(code, compilation, next) {
        if(this.configs.list.length) {
            this.configs.list.forEach((rep)=>{
                code = code.replace(rep.regular, rep.value);
            });
            
            compilation.code = code;
            next();
        } else {
            next();
        }
    }
}