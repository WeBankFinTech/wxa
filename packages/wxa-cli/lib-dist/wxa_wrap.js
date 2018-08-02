'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

exports.default = function (exports, type, path) {
    Object.defineProperty(exports, 'default', {
        get: function get() {
            return this.$value;
        },
        set: function set(x) {
            this.$value = x;
            _core.wxa.launch(type, x, path);
        }
    });

    return exports;
};

var _core = require('@wxa/core');