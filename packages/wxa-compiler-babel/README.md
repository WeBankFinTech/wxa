# wxa-compiler-babel
babel 编译器

## Install 
``` sh
npm i -D @wxa/compiler-babel
```

## Usage

### 使用默认配置

```javascript
// wxa.config.js
module.exports = {
    use: ['babel'],
}
```

### 指定 babel 配置

```javascript
// wxa.config.js
module.exports = {
    use: [{
        name: 'babel',
        test: /\.js$|\.wxs$/,
        options: {
            "sourceMap": false,
            "presets": ["@babel/preset-env"],
            "plugins": [
                ["@babel/plugin-transform-runtime", {"corejs": false, "version": "7.1.2"}],
                ["@babel/plugin-proposal-decorators", {"decoratorsBeforeExport": true}],
                ["@babel/plugin-proposal-class-properties"]
            ],
            "ignore": [
                "node_modules"
            ]
        }
    }],
}
```

在指定 options 的情况下，会优先使用 options 的 babel 配置中，否则会尝试读取项目根目录的 `.babelrc` 文件。
