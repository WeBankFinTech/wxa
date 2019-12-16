# @wxa/plugin-dist-clean
用于在首次build的时候清空dist文件夹，以防止旧文件残留，适用于项目文件有新增或者删除的情况。

本插件是基于 del[https://www.npmjs.com/package/del] 开发

插件配置与del保持一致，由于项目的output文件夹可以从默认配置中读取，所以插件不需要传入额外参数指定对应需要删除的output文件夹

## 使用方法
在项目中的`wxa.config.js`文件对应位置加入以下代码：

```
const CleanPlugin = require('@wxa/plugin-dist-clean');

plugins: [
  new CleanPlugin(),
],
```