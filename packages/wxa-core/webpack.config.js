const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
module.exports = {
    mode: 'production',
    output: {
        library: 'wxa',
        libraryTarget: 'umd',
    },
    module: {
        rules: [
            // {
            //     test: /\.js$/,
            //     use: {
            //         loader: 'babel-loader',
            //     },
            // },
            { test: /\.tsx?$/, loader: "ts-loader" }
        ],
    },
    plugins: [
        new UglifyJsPlugin(),
    ],
    resolve: {
        extensions: [".ts", ".js"]
    },
    // devtool: 'source-map',
    target: 'node',
};
