/* eslint-disable import/no-extraneous-dependencies */

const UglifyjsPlugin = require('@wxa/plugin-uglifyjs');
const ReplacePlugin = require('@wxa/plugin-replace');
// const BindHijackPlugin = require('@wxa/plugin-bind-hijack');
// const BindCapture = require('parse');

const prod = process.env.NODE_ENV === 'production';

// 环境变量
const envlist = {
    WXA_ENV: process.env.NODE_ENV || 'development'
};

module.exports = {
    resolve: {
        alias: {
            '@weux': '@webank/weuxd-mina/packages'
        }
    },
    // use: [
    //     {
    //         test: /\.js$/,
    //         name: 'babel',
    //     },
    // ],
    plugins: [
        new ReplacePlugin({
            list: envlist
        })
        // new BindHijackPlugin(['tap']),
        // ]
        // new BindCapture([])
    ],
    optimization: {
        splitDeps: {
            maxDeps: -1
        }
    }
};

if (prod) {
    module.exports.plugins.push(new UglifyjsPlugin());
}
