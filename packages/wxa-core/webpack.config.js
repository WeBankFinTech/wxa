const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

module.exports = {
    mode: 'production',
    output: {
        library: 'wxa',
        libraryTarget: 'umd',
    },
    resolve: {
        extensions: ['.js', '.mjs', '.ts'],
    },
    module: {
        rules: [
            {
                test: /\.(j|t)s$/, loader: 'ts-loader',
            },
        ],
    },
    plugins: [
        new UglifyJsPlugin(),
    ],
    devtool: 'source-map',
    target: 'node',
};
