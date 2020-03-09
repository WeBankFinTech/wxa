import useMock from './mock/mock';
import {wxa} from '@wxa/core';

// mount directive.

wxa.use(()=>{
    return (vm, type)=>{
        if (type === 'Page') {
            let onReady = vm.onReady;

            vm.onReady = function(...args) {
                useMock(this);

                onReady && onReady.apply(this, args);
            };
        }
    };
});
