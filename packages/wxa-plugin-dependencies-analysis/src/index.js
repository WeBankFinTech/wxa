require("@babel/polyfill");
import { Stats } from './Stats'; 
import { start } from './server';
const fs = require('fs');

export class DependenciesAnalysisPlugin {
    constructor(options = {}) {
         
    }

    apply(compiler) {
        if(!compiler.hooks || !compiler.hooks.done) return;

        compiler.hooks.done.tapAsync('DependenciesAnalysisPlugin', (compilation, next)=>{
            const stats = new Stats();
            const statsJson = stats.toStatsJson(compilation.$indexOfModule)

            fs.writeFileSync('./test-stats.json', JSON.stringify(statsJson, null, 2), 'utf-8');

            start();
            //this.run();
        })
    }

    run(stats) {
        if (this.DAPserver) {

        } else {
            this.DAPserver = start(stats, {
                // host: this.opts.analyzerHost,
                // port: this.opts.analyzerPort,
            })
        }
    }

}    

