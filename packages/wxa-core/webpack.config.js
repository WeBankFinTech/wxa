const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const path = require('path');

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
                test: /\.js$|\.tsx?$/,
                use: {
                    loader: 'babel-loader',
                },
            },
            {
                test: /\.tsx?$/,
                use: [
                    {
                        loader: 'ts-loader',
                        options: {
                            // 指定特定的ts编译配置，为了区分脚本的ts配置
                            configFile: path.resolve(__dirname, './tsconfig.json'),
                        },
                    },
                ],
                exclude: /node_modules/,
            },
        ],
    },
    plugins: [
        new UglifyJsPlugin(),
    ],
    // devtool: 'source-map',
    target: 'node',
};
