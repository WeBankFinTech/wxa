// const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
module.exports = {
    mode: 'production',
    output: {
        library: 'form-wxa-plugin',
        libraryTarget: 'commonjs',
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
        // new UglifyJsPlugin(),
    ],
    // devtool: 'source-map',
    target: 'node',
};
