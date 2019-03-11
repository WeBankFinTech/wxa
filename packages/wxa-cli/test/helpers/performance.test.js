/* eslint-disable no-undef */
import 'jest-plugin-console-matchers/setup';

import Performance from '../../src/helpers/performance';

describe('Performance services for wxa', ()=>{
    test('new instance', ()=>{
        let perf = new Performance();

        // eslint-disable-next-line no-undef
        expect(perf.ob).not.toBeFalsy();

        perf.destory();
    });

    test('if working, then mark timing', ()=>{
        let perf = new Performance();
        perf.IS_WORKING = true;

        perf.markStart('test mark');
        perf.markEnd('test mark');

        expect(perf.entries.size).toBe(1);
        // expect(()=>perf.show()).toConsoleLog();
        perf.show();
        perf.destory();
    });

    test('disable performance', ()=>{
        let perf = new Performance();

        perf.markStart('111');
        perf.markEnd('111');

        expect(perf.entries.size).toBe(0);

        perf.destory();
    });
});
