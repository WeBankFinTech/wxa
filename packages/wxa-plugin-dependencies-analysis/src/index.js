import { Stats } from './Stats';
import { start } from './server';

export class DependenciesAnalysisPlugin {
  constructor(options = {}) {
    this.DAPserver = null;
    this.options = options;
    this.statsHandler = new Stats();
  }

  apply(compiler = {}) {
    try {
      if (!compiler.hooks || 
        (!compiler.hooks.done && !compiler.hooks.finishRebuildModule)
      ) return;

      const DAP_NAME = 'DependenciesAnalysisPlugin';

      compiler.hooks.done.tapAsync(DAP_NAME, (compilation, next) => {
        const statsJson = this.statsHandler.toStatsJson(compilation.$indexOfModule);
  
        this.DAPserver = start(statsJson, this.options);
        next();
      });
  
      compiler.hooks.finishRebuildModule.tapAsync(DAP_NAME, (compilation, changedModule, next) => {
        const statsJson = this.statsHandler.toStatsJson(compilation.$indexOfModule);
        
        this.DAPserver.updateData(statsJson);
        next();
      });
    } catch(err) {
      console.error(err);
    }
  }
}