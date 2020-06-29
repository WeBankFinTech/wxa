
# @wxa/plugin-postcss
[![NPM version](https://img.shields.io/npm/v/@wxa/plugin-postcss/latest.svg)](https://www.npmjs.com/package/@wxa/plugin-postcss)

虽然微信开发者工具提供了自动补全样式的能力（其实也是通过postcss），但是灵活性可能欠佳，本插件允许开发者自定义需要引入的postcss插件:kissing_smiling_eyes:

从[Postcss](https://postcss.org/)可以找到很多实用的插件，譬如用的很多的[autoprefixer](https://github.com/postcss/autoprefixer)，也有专门给小程序做的插件例如：[rpx2rem](https://github.com/landn172/postcss-rpxtorem)

## 安装
``` bash
# 使用npm安装
npm i -S @wxa/plugin-postcss
```

## 用例
```javascript
// wxa.config.js
module.exports = {
    plugins: [
        new PostcssPlugin({
            plugins: [require('autoprefixer')],
        }),
    ]
}
```

## 配置项
### **plugins**
- **类型**: `Array` Default: `[]`
- **用法**: 

postcss的插件。
  
### test
- **类型**: `RegExp` Default: `/\.css$|\.wxss$/`
- **用法**:

指定插件需要对那些文件进行操作。