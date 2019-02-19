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
        if(compiler.hooks == null || compiler.hooks.buildModule == null) return;

        compiler.hooks.buildModule.tap('ReplacePlugin', (mdl)=>{
            if (
                mdl.meta && 
                this.configs.test.test(mdl.meta.source)
            ) {
                debug('Plugin replace started %O', mdl.src)
                this.run(mdl);
            } 
        })
    }
    run(mdl) {
        if (this.list.length && mdl.content) {
            this.list.forEach((rep)=>{
                mdl.content = mdl.content.replace(rep.regular, rep.value);
            });
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