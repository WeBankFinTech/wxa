import path from 'path';
import {performance, PerformanceObserver} from 'perf_hooks';
import {writeFile} from '../utils';
import {Logger} from './logger';

export default class Performance {
    constructor() {
        this.logger = new Logger();
        this.entries = new Set();
        this.IS_WORKING = process.env.NODE_DEBUG==='performance';

        this.ob = new PerformanceObserver((list, observer) => {
            this.entries.add( list.getEntries()[0] );
        });

        this.ob.observe({entryTypes: ['measure']});
    }

    markStart(name) {
        if (!this.IS_WORKING) return;

        performance.mark('start '+name);
    }

    markEnd(name) {
        if (!this.IS_WORKING) return;

        performance.mark('end '+name);
        performance.measure(name, 'start '+name, 'end '+name);
    }

    show() {
        let log = [];
        this.entries.forEach(({name, duration, details})=>{
            this.logger.log('Performance', `${name} ${duration}`);

            // duration > 300 && 
            log.push([name, duration, details]);
        });

        try {
            this.IS_WORKING && writeFile(path.join(this.current, '.wxa', 'performance.json'), JSON.stringify(log, void 0, 2));
            wxaPerformance.clear();
        } catch (__) {}
        return log;
    }

    clear() {
        this.entries.clear();
    }

    destory() {
        this.ob.disconnect();
        this.ob = null;
        this.logger = null;
    }
}

export const wxaPerformance = new Performance();
