const path = require('path');

module.exports = [
    // wrap is too simple to use webpack.
    // {
    //     mode: 'production',
    //     entry: path.join(__dirname, './wxa_wrap.js'),
    //     target: 'node',
    //     output: {
    //         path: path.join(__dirname, '../lib-dist'),
    //         filename: 'wxa_wrap.js',
    //         libraryTarget: 'commonjs',
    //     },
    //     externals: {
    //         '@wxa/core': 'commonjs @wxa/core',
    //     },
    // },
    {
        mode: 'production',
        target: 'node',
        entry: path.join(__dirname, './wxa/directive/index.js'),
        output: {
            path: path.join(__dirname, '../lib-dist/wxa/directive/'),
            filename: 'index.js',
        },
        externals: {
            '@wxa/core': 'commonjs @wxa/core',
        },
    },
    {
        mode: 'production',
        target: 'node',
        entry: path.join(__dirname, './shim/promise.finally.js'),
        output: {
            path: path.join(__dirname, '../lib-dist/es/'),
            filename: 'promise.finally.js',
        },
        externals: {},
    },
];
