# wxa-plugin-uglifyjs
[![NPM version](https://img.shields.io/npm/v/@wxa/plugin-uglifyjs/latest.svg)](https://www.npmjs.com/package/@wxa/plugin-uglifyjs)

使用 `uglifyjs` 压缩美化生产代码。

## 安装
``` bash
# 使用npm安装
npm i -D @wxa/plugin-uglifyjs
```

## 用例
```javascript
module.exports = {
    plugins: [
        new UglifyjsPlugin({
            uglifyjsOptions: {
                // uglifyjs配置
            }
        })
    ]
}
```

## 配置项
### uglifyjsOptions
- **类型**: `Object`
- **用例**:

参考[Uglifyjs](https://github.com/mishoo/UglifyJS2)文档。

### ignore
- **类型**: `Array` Default: `["node_modules"]`
- **用法**:

需要忽略处理的文件。

### test
- **类型**: `RegExp` Default: `/(\.)?js$|script$/`
- **用法**:

指定插件需要对那些文件进行压缩操作。