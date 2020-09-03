<p align="center">
    <a href="https://genuifx.github.io/wxa-doc/">
        <img src="./wxa-logo.png" width="300" height="300" />
    </a>
</p>

<p align="center">
    Decorate your wechat mini-program
</p>

<p align="center">
  <a href="https://travis-ci.org/wxajs/wxa"><img alt="Travis Status" src="https://travis-ci.org/wxajs/wxa.svg?branch=master"></a>
  <a href="https://dev.azure.com/genuifx/wxa/_build?definitionId=1"><img alt="Travis Status" src="https://dev.azure.com/genuifx/wxa/_apis/build/status/wxajs.wxa?branchName=master"></a>
  <a href="https://codecov.io/gh/wxajs/wxa">
    <img src="https://codecov.io/gh/wxajs/wxa/branch/master/graph/badge.svg" />
  </a>
  <img alt="node (scoped with tag, custom registry)" src="https://img.shields.io/badge/node-%3E%3D%208.15.0-brightgreen.svg?maxAge=2592000" />
  <img alt="Licence" src="https://img.shields.io/npm/l/@wxa/core.svg" />
</p>

# @wxa

:tada::tada::tada:AOP Framework for writing wechat mini-program.

**框架优势**

🖖 **极速上手** 无额外的学习门槛，可以完全使用原生的小程序语法开发。

:surfer: **零配置** 标准项目无需任何配置，即可运行。

:penguin: **全方位** 解决小程序开发中的各种痛点，譬如状态管理、表单校验等。

:rocket: **依赖分包算法** 自研的依赖分包算法，帮助开发者充分的利用[分包空间](https://developers.weixin.qq.com/miniprogram/dev/framework/subpackages/basic.html)。

:curly_loop: **依赖分析** 自动分析项目依赖，无需手动 copy 三方依赖到项目中。

🤖 **组件库** 任意第三方组件库，随时安装使用，完美适配 weui, vant-weapp, wux-weapp, iview-weapp 等组件库。

:light_rail: **低成本** 超低迁移成本，原生小程序只需安装好依赖就可以马上在 `@wxa/cli2` 中跑起来。支持原生和wxa混杂开发。

:alien: **多实例** 一次性编译出多个三方项目或其他平台的小程序，如头条小程序。

More detail [documents](https://wxajs.github.io/wxa/)

更完善的[文档](https://wxajs.github.io/wxa/)

## 简介

wxa是一个AOP框架，主要使用Decorator（运行时改写，拦截）和预编译实现框架功能。

使用 Decorator 实现了：

:white_check_mark: `Fetch` 队列管理网络请求，单个请求自动防重。

:white_check_mark: `Router` 简洁的API、预加载特性。

:white_check_mark: `Lock` 防止重复执行函数，前端防重利器。

:white_check_mark: `Debounnce` 防抖动。

:white_check_mark: `Mixin` 混合代码，代码复用。

查看详细的 [Class Decorators](https://wxajs.github.io/wxa/core/decorators/class.html) [Method Decorators](https://wxajs.github.io/wxa/core/decorators/methods.html)

预编译方面，实现了对小程序项目的依赖解析，利用依赖树对整个项目进行管理，以此为基础适配了`npm`、单文件开发、云开发、三方开发。开发语法方面支持最新的ES*语法（包括Async/Await）、Sass/Scss、Stylus，有需求的话可以适配更多语法。

## Install

使用 `yarn` 或 `npm` 全局安装

```bash
npm i -g @wxa/cli2
```

## Quick Started

**极速新建项目**

```bash
wxa2 create --repo gitee
```

**开始开发**

定义App类并导出：

```javascript
import {App} from '@wxa/core';

@App
export default class Main {
    globalData = {
        userInfo: 'Genuifx',
    }
}
```

定义页面类并导出：

```javascript
// 引入core包提供的Decorator
import {Page, Debounce} from '@wxa/core';

// 挂载常用的方法到页面类
// 导出一个默认的页面类
@Page
export default class Index { 
    // 页面方法用于响应用户操作，函数自动防抖动
    @Debounce(300)
    tap() {
        // 通过$storage缓存数据
        this.$storage.set('TAP', true);
    }
}
```

默认导出的方法将会自动调用小程序相应的 `Page`、 `Component`、 `App` 方法进行注册。

更完善的[文档](https://wxajs.github.io/wxa/)

**极速预览小程序**

```bash
wxa2 cli --action preview
```


## Contribution

欢迎各种 `PR` 和 `ISSUE`


## LICENSE

[MIT](./LICENSE)
