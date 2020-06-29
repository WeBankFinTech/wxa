# @wxa/plugin-copy
[![NPM version](https://img.shields.io/npm/v/@wxa/plugin-copy/latest.svg)](https://www.npmjs.com/package/@wxa/plugin-copy)

一般来说，对于动态路径：
::: v-pre 
`path/to/dir/{{boo}}.png` 
:::
`@wxa/cli`并不会为你解析寻找出所有文件（需要递归的枚举所有符合条件路径的文件）。所以在开发的时候，我们需要额外的将这些静态资源从项目路径copy到dist目录，这就是`CopyPlugin`做的事情:smiling_imp:。

## 安装
``` bash
# 使用npm安装
npm i -S @wxa/plugin-copy
```

## 用例
```js
{
    context: path.resolve(__dirname, 'src'),
    plugins: [
        new CopyPlugin({
            from: './static', // relative to process.cwd
            to: 'static',  // dist dir name
            ignore: ['a.png']
        })
    ]
}
```

## 配置项
### from
- **类型**: `String`
- **用法**:

需要复制的文件夹，相对于当前路径，即`process.cwd()`。

### to
- **类型**: `String`
- **用法**:

目的文件夹。

### ignore
- **类型**: `Array`
- **用法**:

需要忽略处理的文件。