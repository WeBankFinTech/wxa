import { Stats } from './Stats'; 
const start = require('webpack-bundle-analyzer').start;
// let testStats = require('../test/test-stats.json');
// let testIndexOfModule = require('../test/test-data-indexOfModule.json');
// const stats = new Stats();
// start(stats.toStatsJson(testIndexOfModule), {});

export class DependenciesAnalysisPlugin {
    constructor(options = {}) {
         
    }

    apply(compiler) {
        try {
            compiler.hooks.done.tapAsync('DependenciesAnalysisPlugin', (compilation, next)=>{
                const stats = new Stats();
                const statsJson = stats.toStatsJson(compilation.$indexOfModule)
                this.runServer(statsJson);
            })
        } catch(err) {
            console.error(err);
        }
    }

    runServer(stats) {
        if (this.DAPserver) {

        } else {
            this.DAPserver = start(stats, {
                // host: this.opts.analyzerHost,
                // port: this.opts.analyzerPort,
            })
        }
    }

}    

