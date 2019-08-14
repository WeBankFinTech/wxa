# @wxa/plugin-minify-wxml
用于压缩小程序wxml文件，避免由于代码中标签换行一起在真机显示时出现多余空格的问题

本插件是基于 html-minifier[https://github.com/kangax/html-minifier] 开发

插件配置与html-minifier保持一致，插件默认使用如下配置：
```
{
  caseSensitive: true,
  keepClosingSlash: true,
  collapseWhitespace: true,
  removeComments: true
}
```

## 使用方法
在项目中的`wxa.config.js`文件对应位置加入以下代码：

```
const MinifyWxmlPlugin = require('@wxa/plugin-minify-wxml');

plugins: [
    new MinifyWxmlPlugin()
    // new MinifyWxmlPlugin({自定义配置})
],
```