import {wxa} from '@wxa/core';

export default function(exports, type, path) {
    Object.defineProperty(exports, 'default', {
        get() {
            return this.$value;
        },
        set(x) {
            this.$value = x;

            if (x == null) return;

            wxa.launch(type, x, path);
        },
    });

    return exports;
}
