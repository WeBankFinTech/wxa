const minify = require('html-minifier').minify;
const debug = require('debug')('WXA:PLUGIN-REPLACE')

module.exports = class MinifyWxmlPlugin {
    constructor(options = {}){
        this.configs = Object.assign({}, {
            test: /\.wxml$/,
            plugins: []
        }, options);
    }

    apply(compiler){
      if (compiler.hooks == null || compiler.hooks.optimizeAssets == null) return;

      compiler.hooks.optimizeAssets.tapAsync('MinifyWxmlPlugin', (compilation, next) => {
          if (
            compilation.meta &&
              this.configs.test.test(compilation.meta.source)
          ) {
              debug('Minify wxml plugin started %O', compilation.src)
              this.run(compilation, next);
          }else{
            next();
          }
      })
    }

    run(compilation, next) {
      try {
        compilation.code = minify(compilation.code, {
          caseSensitive: true,
          keepClosingSlash: true,
          collapseWhitespace: true
        });
        next(null);
      } catch (error) {
        next(error);
      }
    }
};
