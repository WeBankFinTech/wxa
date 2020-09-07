const del = require('del');
const debug = require('debug')('WXA:CLEAN-DIST');

module.exports = class CleanDistPlugin {
  constructor(){}

  apply(compiler){
    if (compiler.hooks == null || compiler.hooks.beforeRun == null) return;

    compiler.hooks.beforeRun.tapAsync('CleanDistPlugin', (compilation, next) => {
      debug('Clean dist plugin started %O', compilation.src)
      this.run(compilation, next);
    });
  }

  run(compilation, next) {
    try {
      (async () => {
        // 需要同步等待结果返回，否则可能毁于后期编译写入文件有冲突
        const deletedPaths = await del([compilation.wxaConfigs.output.path]);
        console.log('Deleted: ', deletedPaths.join('\n'));
        next(null);
      })();
    } catch (error) {
      next(error);
    }
  }
};
