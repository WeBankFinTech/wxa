# wxa-compiler-babel
babel 编译器, 用于将 ESnext 语法转义到 ES5，以便运行在小程序平台中。

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

在指定 options 的情况下，会优先使用 options 的 babel 配置中，否则会尝试读取项目根目录的 `.babelrc` 或 `babel.config.js` 文件。


### 使用 Typscript 开发

安装 `@babel/preset-typescript` 后，修改一下配置即可：

```javascript
// wxa.config.js
module.exports = {
    use: [{
        name: 'babel',
        test: /\.js$|\.wxs$/,
        options: {
            "sourceMap": false,
            "presets": ["@babel/preset-env", "@babel/preset-typescript"],
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
