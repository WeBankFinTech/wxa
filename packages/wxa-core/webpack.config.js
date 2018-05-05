const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
module.exports = {
    mode: 'production',
    output: {
        library: 'wxa',
        libraryTarget: 'umd',
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                use: {
                    loader: 'babel-loader',
                },
            },
        ],
    },
    plugins: [
        new UglifyJsPlugin(),
    ],
    // devtool: 'source-map',
    target: 'node',
};
