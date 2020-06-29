# @wxa/plugin-replace
[![NPM version](https://img.shields.io/npm/v/@wxa/plugin-replace/latest.svg)](https://www.npmjs.com/package/@wxa/plugin-replace)

实际开发项目中，我们往往需要区分测试和生产环境参数，针对不同环境做不同处理，譬如测试环境下允许debug，生产环境又严格禁止。

使用`plugin-replace`可以很方便的替换js, json, template, css中匹配的字符串:tada:。

## 安装
``` bash
# 使用npm安装
npm i -S @wxa/plugin-replace
```

## 用例
```javascript
// wxa.config.js
module.exports = {
    plugins: [
        // 传递一个规则数组
        new ReplacePlugin({
          list: [{
            regular: new RegExp('APP_ENV', 'gm'),
            value: 'bcds'
          }]
        })
        // 或者一个规则对象，key为目标字符串，value为替换内容
        new ReplacePlugin({
          list: {
            'APP_ENV': 'bcds'
          }
        })
    ]
}
```

## 配置项
### **list**
- **类型**: `{Object, Array} list` Default: `[]`
- **用法**: 

替换规则的数组或对象。
  
### **flag**
- **类型**: `{String} flag` Default: `gm`
- **用法**: 

正则标志位。