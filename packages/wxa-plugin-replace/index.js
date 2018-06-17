module.exports = class ReplacePlugin {
    constructor(options={}) {
        this.configs = Object.assign({
            list: [],
            flag: 'gm'    
        }, options);
        if(typeof this.configs.list === 'object' && this.configs.list !== null) {
            this.list = this.mapConfigsToWxa(this.configs.list);
        } else if(Array.isArray(this.configs.list)){
            this.list = this.configs.list;
        } else {
            this.list = [];
        }
    }   
    apply(compiler) {
        compiler.hooks.optimizeAssets.tapAsync('replacePlugin', (opath, compilation, next)=>{
            this.run(opath, compilation, next);
        })
    }
    run(opath, compilation, next) {
        if(this.list.length) {
            this.list.forEach((rep)=>{
                compilation.code = code.replace(rep.regular, rep.value);
            });
            
            next();
        } else {
            next();
        }
    }
    mapConfigsToWxa(configs) {
        if(configs == null) return [];

        return Object.keys(configs).reduce((ret, name, idx)=>{
            ret.push({
                regular: new RegExp(name, this.configs.flag),
                value: configs[name],
            });
            return ret;
        }, []);
    }
}