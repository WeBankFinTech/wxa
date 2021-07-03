import {performance, PerformanceObserver} from 'perf_hooks';
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
        this.entries.forEach(({name, duration})=>{
            this.logger.log('Performance', `${name} ${duration}`);
        });
    }

    destory() {
        this.ob.disconnect();
        this.ob = null;
        this.logger = null;
    }
}

export const wxaPerformance = new Performance();
