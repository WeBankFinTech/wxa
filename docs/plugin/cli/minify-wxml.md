# @wxa/plugin-minify-wxml

[![NPM version](https://img.shields.io/npm/v/@wxa/plugin-minify-wxml/latest.svg)](https://www.npmjs.com/package/@wxa/plugin-minify-wxml)

使用 `html-minifier` 压缩 `wxml` 代码。

## 安装
``` bash
# 使用npm安装
npm i -D @wxa/plugin-minify-wxml
```

## 用例
```javascript
const MinifyWxmlPlugin = require('@wxa/plugin-minify-wxml');
module.exports = {
    plugins: [
         new MinifyWxmlPlugin(),
    ]
}
```
