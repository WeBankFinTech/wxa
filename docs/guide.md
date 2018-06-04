---
sidebar: auto
---

wxa是一套完善的微信小程序开发解决方案，通过Decorator增强小程序能力，基于nodejs工程化小程序开发流程，同时支持Vue单文件开发模式和原生小程序开发模式！此外还提供了一套基于wxa开发UI组件。

## 快速开始
wxa提供了一个方便好用的`cli`工具，使用cli可以快速从github拉取手脚架，快速开始小程序开发

#### 1. 安装依赖
1. 检查node依赖（node6+）    
2. `npm i -g @wxa/cli` 

#### 2. 使用手脚架创建项目
1. `wxa create base helloWorld`
2. `cd helloWorld`
3. `npm i`

#### 3. 编译项目
1. `wxa build --watch`

#### 4. 从微信开发者工具打开
在微信开发者工具中填入小程序appid，把目录指向`path/to/helloWorld/dist`。然后就可以开始wxa项目开发了！

## 迁移项目到wxa
原有的小程序项目可以不改动代码的情况下快速迁移到wxa下！只需要稍微加配置，旧的小程序项目一样可以享受`@wxa`提供的便利~
#### 1. 安装依赖
- 检查node依赖（node6+）    
- `npm i -g @wxa/cli` 
- 安装以下开发依赖
```json
    "@wxa/core": "^1.1.6",
    "@wxa/plugin-replace": "^1.0.2",
    "@wxa/plugin-uglifyjs": "^1.0.2",
    "@wxa/compiler-babel": "^1.0.3",
    "@wxa/compiler-sass": "^1.0.3",
    "@wxa/compiler-stylus": "^1.0.0",
    "babel-eslint": "^8.2.1",
    "babel-plugin-transform-class-properties": "^6.24.1",
    "babel-plugin-transform-decorators-legacy": "^1.3.4",
    "babel-plugin-transform-export-extensions": "^6.22.0",
    "babel-plugin-transform-object-rest-spread": "^6.26.0",
    "babel-preset-env": "^1.6.1",
```

#### 2. 添加配置
- 添加`wxa.config.js`到项目目录    
```javascript
    const path = require('path');
    const UglifyjsPlugin = require('@wxa/plugin-uglifyjs');
    const ReplacePlugin = require('@wxa/plugin-replace');
    let prod = process.env.NODE_ENV === 'production';
    const env = process.env.NODE_ENV || 'development';
    const envlist = require('./app.config')[env];
    module.exports = {
        // 指定微信开发者工具的目录，用于从cli调用其接口
        wechatwebdevtools: '/Applications/wechatwebdevtools.app',
        // 解析配置
        resolve: {
            alias: {
                '@': path.join(__dirname, 'src'),
            },
        },
        // 使用到的compiler
        use: ['babel', 'sass', 'stylus'],
        // compiler的配置，如果需要单独配置compiler，写在这里
        compilers: {
        },
        // 使用到的plugins
        plugins: [
            new ReplacePlugin({
                list: envlist,
            }),
        ],
    };
    if (prod) {
        module.exports.plugins.push(new UglifyjsPlugin());
    }
```
- 添加`.babelrc`文件，可以根据自己开发需要去修改
```json
{
    "sourceMap": false,
    "presets": [
        "env"
    ],
    "plugins": [
        "transform-class-properties",
        "transform-decorators-legacy",
        "transform-object-rest-spread",
        "transform-export-extensions"
    ],
    "ignore": "node_modules"
}
```

#### 3. 编译项目
使用命令行运行`wxa build --watch`

#### 4. 从微信开发者工具打开
在微信开发者工具中填入小程序appid，把目录指向`path/to/project/dist`。然后就可以开始wxa项目开发了！

## 初衷
小程序自诞生开始，大家对改进其开发流程都有自己的见解，例如组件化方面有[zanui](https://github.com/youzan/zanui-weapp)，[weui](https://github.com/Tencent/weui-wxss/), 框架方面有[wepy](https://github.com/Tencent/wepy)。过去一年，一直在观望wepy，文档和源码都有拜读了，不得不说思路的确很惊艳，几次都想在项目中应用，又被大量issue吓退了，等到wepy相当稳定的时候，结果官方又支持了自定义组件了，于是一直都是使用自己开发部署流程在工作，的确发现有很多改进的地方，写了wxa希望能把自己的一些想法加进去，同时改进一下开发的工作流。

<style>
    body {
        font-family: -apple-system, ".SFNSDisplay-Regular", "Helvetica Neue", Helvetica, "Microsoft YaHei", Arial, sans-serif;
    }
</style>