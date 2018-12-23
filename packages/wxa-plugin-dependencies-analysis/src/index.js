import { Stats } from './Stats';
import { start } from './server';
import { writeFileSync } from 'fs';

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
        try{
          const statsJson = this.statsHandler.get(compilation.$indexOfModule);
          this.DAPserver = start(statsJson, this.options);
          next();
        } catch(e) {
          next(e);
        }
      });
  
      compiler.hooks.finishRebuildModule.tapAsync(DAP_NAME, (compilation, changedModule, next) => {
        try {
          const statsJson = this.statsHandler.get(compilation.$indexOfModule);
          this.DAPserver.updateData(statsJson);

          next();
        } catch (e) {
          next(e);
        }
        
      });
    } catch(err) {
      console.error(err);
    }
  }
}