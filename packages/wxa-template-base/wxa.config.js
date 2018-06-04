const path = require('path');
const UglifyjsPlugin = require('@wxa/plugin-uglifyjs');
const ReplacePlugin = require('@wxa/plugin-replace');
let prod = process.env.NODE_ENV === 'production';
const envlist = [];

module.exports = {
    resolve: {
        alias: {
            '@': path.join(__dirname, 'src'),
        },
    },
    use: ['babel', 'sass'],
    compilers: {
        sass: {},
    },
    plugins: [
        new ReplacePlugin({
            list: envlist,
        }),
    ],
};

if (prod) {
    module.exports.plugins.push(new UglifyjsPlugin());
}
