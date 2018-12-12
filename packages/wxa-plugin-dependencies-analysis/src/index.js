require("@babel/polyfill");
import { Stats } from './Stats';
import { start } from './server';

export class DependenciesAnalysisPlugin {
  constructor(options = {}) {
    this.DAPserver = null;
    this.options = options;
  }

  apply(compiler) {
    if (!compiler.hooks || !compiler.hooks.done) return;

    compiler.hooks.done.tapAsync('DependenciesAnalysisPlugin', (compilation, next) => {
      const stats = new Stats();
      const statsJson = stats.toStatsJson(compilation.$indexOfModule)

      this.run(statsJson);

    })
  }

  run(stats) {
    if (this.DAPserver) {
      this.DAPserver.updateData(stats);
    } else {
      this.DAPserver = start(stats, this.options);
    }
  }
}