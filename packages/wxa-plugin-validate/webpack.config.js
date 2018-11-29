const env = process.env.NODE_ENV;
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
let config = {
    mode: env === 'production'? 'production': 'none',
    output: {
        library: 'form-wxa-plugin',
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

    ],
    target: 'node',
};

if(env === 'production') {
    config.plugins.push(new UglifyJsPlugin());
} else {
    config.devtool = 'source-map';
}

module.exports = config;
