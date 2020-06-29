# CLI

![NpmLicense](https://img.shields.io/npm/l/@wxa/cli2.svg)
![node (scoped with tag, custom registry)](https://img.shields.io/badge/node-%3E%3D%208.15.0-brightgreen.svg?maxAge=2592000)
[![NPM version](https://img.shields.io/npm/v/@wxa/cli2/latest.svg)](https://www.npmjs.com/package/@wxa/cli2)

为小程序开发定制的命令行工具。以模块化方式处理项目依赖，通过依赖分析得到整个项目的结构，在优化代码后最终生成目标小程序代码。

**插件机制**上面，采用最新webpack设计的[Tapable](https://github.com/webpack/tapable)插件机制，对于熟悉webpack插件开发的人来说，可以快速上手cli的插件开发。

助力**三方开发**。对于三方项目而言，往往需要在使用框架的同时再手写脚本，以保证一个项目能编译到多个小程序。2.0在这方便做了改进，利用依赖分析树针对不同合作方输出不同页面，支持一次性将项目编译到出多个小程序，同时支持监听模式下的一对多（可能会内存占用高，慎用）。

独特的**依赖分包算法**。随着小程序项目的不断迭代，不可避免的体积会越来越大，而分包是唯一解决小程序包大于 2M 的方法。随着而来的问题是如何合理的分配分包和主包的空间，wxa 自研了依赖分包算法，可以将项目依赖合理的分配到分包和主包，最大程度的平衡代码复用和空间分配。

## 特性
- :surfer: **零配置** 标准项目无需任何配置，即可运行。
- :rocket: **依赖分包算法** 自研的依赖分包算法，帮助开发者充分的利用[分包空间](https://developers.weixin.qq.com/miniprogram/dev/framework/subpackages/basic.html)。
- :curly_loop: **依赖分析** 自动分析项目依赖，无需手动 copy 三方依赖到项目中。
- 🤖 **组件库** 任意第三方组件库，随时安装使用，完美适配 weui, vant-weapp, wux-weapp, iview-weapp 等组件库。
- 🖖 **Vue单文件** SFC 单文件组件开发，组件和页面可以把`js`,`wxss`,`wxml`,`json`写在同一个`.wxa`文件。
- :electric_plug: **插件机制** 利用插件机制，可以定制自己的文件处理流。
- :computer: **编译器** 支持`ES*`, `Sass`, `Stylus`。
- :loop: **CLI调用** 无需打开开发者工具，即可预览、上传代码。:airplane:
- :dart: **批量编译** 一次性编译出多个三方开发小程序。

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
`wxa2 build`

2. 监听模式
`wxa2 build --watch`

3. 指定无效缓存以及打印更详细的构建信息
`wxa2 build --no-cache --verbose`

4. 使用模板创建新项目, [template](https://github.com/Genuifx/wxa-templates) 网络环境的关系建议拉取 gitee 源
`wxa2 create --repo gitee`

5. 调用微信开发者工具, windows用户需要在 `wxa.config.js` 设置开发者工具的路径 `wechatwebdevtools`
    - `wxa2 cli -a open`: 打开开发者工具
    - `wxa2 cli -a preview`: 预览项目
    - `wxa2 cli -a upload`: 上传项目
    - `wxa2 cli -a login`: 登录微信，`preview`和`upload`都需要登录微信后操作