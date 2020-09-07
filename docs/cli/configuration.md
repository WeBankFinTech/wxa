# 配置项

默认情况下，`cli`不需要任何配置即可运行在一个标准小程序项目中。然而在实际生产项目中，针对不同项目个性化配置是必不可少的，此时可以在项目根目录下新建一个`wxa.config.js`，根据需要增加、删除对应配置，cli将根据配置文件进行编译工作。

## 默认配置
`wxa`的默认配置如下：

``` js

let context = path.resolve(this.cwd, 'src');
module.exports = {
    target: 'wxa',
    dependencyManager: 'npm',
    context,
    resolve: {
        wxaExt: '.wxa',
        extensions: ['.js', '.json'],
        appScriptPath: path.join(context, 'app.js'),
        appConfigPath: path.join(context, 'app.json'),
        alias: {
            '@': path.join(this.cwd, 'src'),
        },
    },
    entry: [path.resolve(this.cwd, 'src/app*'), path.resolve(this.cwd, 'src/project.config.json'), path.resolve(this.cwd, 'src/ext.json')],
    output: {
        path: path.resolve(this.cwd, 'dist'),
    },
    use: [
        {
            test: /\.js$/,
            name: 'babel',
        },
        {
            test: /\.sass|\.scss/,
            name: 'sass',
        },
    ],
    optimization: {
        // 自动分配第三方依赖到分包和主包
        splitDeps: {
            maxDeps: -1,
        },
        // 是否允许空属性，请勿轻易改动，除非你很清楚自己在做什么
        allowEmptyAttributes: true,
        // 是否自动将 px 转为 rpx 单位
        transformPxToRpx: false,
    },
};
```

## target
- **类型**: `String` Default: `wxa`
- **用法**: 

编译的目标，当前只支持编译到微信小程序，即 `wxa`。

## context
- **类型**: `String` Default: `path.resolve(this.cwd, 'src')`
- **用法**:

上下文。所有项目中的绝对路径都基于 `context` 计算。

## resolve

- **类型**: `Object`
- **用法**:

解析相关配置。

### resolve.wxaExt
- **类型**: `String` Default: `.wxa`
- **用法**: 

单文件后缀，默认`.wxa`后缀即为单文件组件。

### resolve.extensions
- **类型**: `Array` default: `['.js', '.json']`
- **用法**:

允许省略后缀的依赖。默认js/json文件可以不写后缀。

### resolve.appConfigPath
- **类型**: `String` default: `path.join(context, 'app.json')`
- **用法**:

指定`app.json`的位置，wxa将根据`app.json`对所有依赖的页面/分包页面进行编译。

### resolve.alias
- **类型**: `Object`
- **用法**:

别名

## entry
- **类型**: `Array`
- **用法**:

入口文件，默认包含`app.*`和`project.config.json`。支持glob写法。

## output
- **类型**: `Object`
### output.path
- **类型**: `String` Default: `path.resolve(this.cwd, 'dist')`
- **用法**:

指定输出文件夹。

## use 
- **类型**: `Array`

### use / test
- **类型**: `RegExp`
- **用法**:

指定当前compiler对那些文件生效。

### use / name
- **类型**: `String`
- **用法**:

指定加载对应的compiler，如`babel`，则cli将自动加载项目依赖中的`@wxa/compiler-babel`。
目前支持的compiler有：
- [`@wxa/compiler-babel`](https://github.com/Genuifx/wxa/tree/master/packages/wxa-compiler-babel)
- [`@wxa/compiler-sass`](https://github.com/Genuifx/wxa/tree/master/packages/wxa-compiler-sass)
- [`@wxa/compiler-stylus`](https://github.com/Genuifx/wxa/tree/master/packages/wxa-compiler-stylus)

### use / options
- **类型**: `Object`
- **用法**: 

传递给对应compiler的配置。

## optimization
### optimization.splitDeps.maxDeps
是否应用依赖分包算法，自动分配依赖到主包分包。默认为 -1，即关闭，maxDeps的含义为当且仅当 N 个分包同时依赖一个第三方的包，该包会被分配到主包，N >= maxDeps。

### optimization.allowEmptyAttributes
是否允许空属性，默认 `true`，自动补全清单内的属性。

### optimization.transformPxToRpx
是否自动将 px 转为 rpx 单位，默认 `false`。打开该开关将自动使用 `postcss`  [插件](https://github.com/Genuifx/postcss-pxtorpx-pro)将项目中的 `px` 单位按照比例转为`rpx` 单位

## plugins

目前支持的插件有：
- [`@wxa/plugin-replace`](https://github.com/Genuifx/wxa/tree/master/packages/wxa-plugin-replace)
- [`@wxa/plugin-uglifyjs`](https://github.com/Genuifx/wxa/tree/master/packages/wxa-plugin-uglifyjs)
- [`@wxa/plugin-postcss`](https://github.com/Genuifx/wxa/tree/master/packages/wxa-plugin-postcss)
- [`@wxa/plugin-copy`](https://github.com/Genuifx/wxa/tree/master/packages/wxa-plugin-copy)

用法如下：

``` js
const UglifyjsPlugin = require('@wxa/plugin-uglifyjs');
const ReplacePlugin = require('@wxa/plugin-replace');
// 根据环境参数不同，替换不同的参数。
let prod = process.env.NODE_ENV === 'production';
// 环境变量
const envlist = [{
    'WXA_ENV': process.env.NODE_ENV || 'development'
}];

module.exports = {
    plugins: [
        // 替换项目中所有符合规则的字符。
        new ReplacePlugin({
            list: envlist,
        }),
    ],
};

if (prod) {
    // 生产环境压缩代码
    module.exports.plugins.push(new UglifyjsPlugin());
}
```
