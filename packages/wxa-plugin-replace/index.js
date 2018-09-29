var debug = require('debug')('WXA:PLUGIN-REPLACE')

module.exports = class ReplacePlugin {
    constructor(options={}) {
        this.configs = Object.assign({
            list: [],
            test: /\.js$|\.json$|\.css$|\.wxml$/,
            flag: 'gm'    
        }, options);
        if(Array.isArray(this.configs.list)) {
            this.list = this.configs.list;
        } else if(typeof this.configs.list === 'object' && this.configs.list !== null){
            this.list = this.mapConfigsToWxa(this.configs.list);
        } else {
            this.list = [];
        }
    }   
    apply(compiler) {
        if(compiler.hooks == null || compiler.hooks.optimizeAssets == null) return;

        compiler.hooks.optimizeAssets.tapAsync('replacePlugin', (compilation, next)=>{
            if (
                compilation.meta && 
                this.configs.test.test(compilation.meta.source)
            ) {
                debug('Plugin replace started %O', compilation)
                this.run(compilation, next);
            } else {
                next();
            }
        })
    }
    run(compilation, next) {
        if(this.list.length && compilation.code) {
            this.list.forEach((rep)=>{
                compilation.code = compilation.code.replace(rep.regular, rep.value);
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