# @wxa/cli2
[![NPM version](https://img.shields.io/npm/v/@wxa/cli2/next.svg)](https://www.npmjs.com/package/@wxa/cli2)
![node (scoped with tag, custom registry)](https://img.shields.io/node/v/@stdlib/stdlib/latest.svg?registry_uri=https%3A%2F%2Fregistry.npmjs.com)
![NpmLicense](https://img.shields.io/npm/l/@wxa/cli2.svg)

[详细的文档](https://genuifx.github.io/wxa/cli/)

[More Detail Documentation](https://genuifx.github.io/wxa/cli/)

为小程序开发定制的命令行工具。以模块化方式处理项目依赖，通过依赖分析得到整个项目的结构，在优化代码后最终生成目标小程序代码。

**插件机制**上面，采用最新webpack设计的[Tapable](https://github.com/webpack/tapable)插件机制，对于熟悉webpack插件开发的人来说，可以快速上手cli的插件开发。

助力**三方开发**。对于三方项目而言，往往需要在使用框架的同时再手写脚本，以保证一个项目能编译到多个小程序。2.0在这方便做了改进，利用依赖分析树针对不同合作方输出不同页面，支持一次性将项目编译到出多个小程序，同时支持监听模式下的一对多（可能会内存占用高，慎用）。

## 特性
- :white_check_mark: **Npm** 直接在项目引入`node_modules`的内容，无需手工复制依赖库。
- :white_check_mark: **Vue单文件** 组件和页面可以把`js`,`wxss`,`wxml`,`json`写在同一个`.wxa`文件。
- :white_check_mark: **第三方组件** 在`usingComponents`中直接引入即可。
- :white_check_mark: **插件机制** 利用插件机制，可以定制自己的文件处理流。
- :white_check_mark: **编译器** 支持`ES*`, `Sass`, `Stylus`。
- :white_check_mark: **CLI调用** 无需打开开发者工具，即可预览、上传代码。:airplane:
- :white_check_mark: **三方开发** 一次性编译出多个三方小程序。

## TODO
- :ballot_box_with_check: **编译到其他小程序平台**
- :ballot_box_with_check: **小程序原生插件开发**
- :ballot_box_with_check: **Tree-Shaking**

## 安装
```bash
# 使用npm安装
npm i -g @wxa/cli2
```

::: tip 提示
`@wxa/cli2`运行在node环境中，先安装[node](https://nodejs.org/en/)。
:::

## 基本用例
1. 基础编译
`wxa build`

2. 监听模式
`wxa build --watch`

3. 指定无效缓存以及打印更详细的构建信息
`wxa build --no-cache --verbose`

4. 使用模板创建新项目, [template](https://github.com/Genuifx/wxa-templates)
`wxa create`

5. 调用微信开发者工具, windows用户需要在`wxa.config.js`设置开发者工具的路径`wechatwebdevtools`
    - `wxa cli -a open`: 打开开发者工具
    - `wxa cli -a preview`: 预览项目
    - `wxa cli -a upload`: 上传项目
    - `wxa cli -a login`: 登录微信，`preview`和`upload`都需要登录微信后操作
