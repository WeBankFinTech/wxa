var fs = require('fs-extra');
var path = require('path');
var mkdirp = require('mkdirp');

module.exports = class CopyPlugin {
    constructor(options={}) {
        // from, to, ignore
        this.options = {
            to: 'static',
            ...options
        }

        this.options.ignore = typeof this.options.ignore === 'string' ? [this.options.ignore] : 
        this.options.ignore ? this.options.ignore : [];
    }   
    apply(compiler) {
        if(compiler.hooks == null || compiler.hooks.done == null) return;

        compiler.hooks.done.tapAsync('CopyPlugin', (compilation, next)=>{
            if(this.options.from == null) {
                console.warn('CopyPlugin配置错误')
                next();
            }

            this.run(compilation, next);
        })
    }
    run(compilation, next) {
        var source = path.isAbsolute(this.options.from) ? this.options.from : path.join(compilation.meta.current, this.options.from);
        var dist = path.join(compilation.wxaConfigs.output.path, this.options.to);
        var options = this.options;

        mkdirp(dist, function(err) {
            if(err) return next(err);

            fs.copy(source, dist, {
                filter(filename){
                    return !options.ignore.some((value)=>{
                        let reg = value instanceof RegExp ? value : new RegExp(value);
                        return reg.test(filename);
                    });
                }
            }, function(err){
                if(err) {
                    next(err)
                }
    
                next();
            });
        })
    }
}