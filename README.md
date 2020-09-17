<p align="center">
    <a href="https://webankfintech.github.io/wxa/">
        <img src="./docs/.vuepress/public/wxajs-color.svg" width="300" height="300" />
    </a>
</p>
<h3 align="center">
    渐进式小程序开发框架
</h3>
<p align="center">
    <a href="https://www.npmjs.com/package/@wxa/cli2"><img alt="Travis Status" src="https://img.shields.io/npm/v/@wxa/cli2.svg?label=NPM&color=brightGreen&style=flat-square&logo=npm"></a>
    <img alt="node (scoped with tag, custom registry)" src="https://img.shields.io/badge/Node-%3E%3D%208.15.0-brightgreen.svg?maxAge=2592000&style=flat-square&logo=node" />
    <img alt="License" src="https://img.shields.io/npm/l/@wxa/core.svg?color=brightGreen&style=flat-square&label=License" />
</p>
<p align="center">
    <a href="https://github.com/WeBankFinTech/wxa/actions"><img alt="Github Actions" src="https://github.com/WeBankFinTech/wxa/workflows/Jest%20&%20Codecov/badge.svg?branch=master&style=flat-square"></a>
    <a href="https://dev.azure.com/genuifx/wxa/_build?definitionId=1"><img alt="Travis Status" src="https://dev.azure.com/genuifx/wxa/_apis/build/status/wxajs.wxa?branchName=master"></a>
    <a href="https://codecov.io/gh/WeBankFinTech/wxa">
        <img src="https://codecov.io/gh/WeBankFinTech/wxa/branch/master/graph/badge.svg" />
    </a>
</p>

# wxa.js

轻量级小程序开发框架，专注于小程序原生开发，提供更好的工程化、代码复用能力，提高开发效率并改善开发体验。

极速上手，零配置，可无痛迁移。


**框架优势**

- 🖖 **极速上手** 无额外的学习门槛，可以完全使用原生的小程序语法开发。

- :surfer: **零配置** 标准项目无需任何配置，即可运行。

- :light_rail: **低成本** 超低迁移成本，原生小程序可以马上在 `@wxa/cli2` 中跑起来。支持原生和 wxa 混杂开发，助力老项目逐步迁移。

- :rocket: **依赖分包算法** 自研的依赖分包算法，帮助开发者充分的利用[分包空间](https://developers.weixin.qq.com/miniprogram/dev/framework/subpackages/basic.html)。

- :curly_loop: **依赖分析** 自动分析项目依赖，无需手动 copy 三方依赖到项目中。

- :penguin: **全方位** 提供小程序开发增强能力，譬如状态管理、表单校验等。

- 🤖 **按需引入** 任意第三方工具、组件库，随时安装使用，完美适配 weui, vant-weapp等组件库。

- :alien: **多实例** 一次性编译出多个三方项目或其他平台的小程序，如头条小程序。

More detail [documents](https://wxajs.gitee.io/wxa/)

更完善的[文档](https://wxajs.gitee.io/wxa/)


## 安装使用

使用 `yarn` 或 `npm` 全局安装

```bash
npm i -g @wxa/cli2
```

**极速新建项目**

```bash
wxa2 create startup
```

**启动开发环境**

```bash
npm run dev
```

## 开发示例

#### app.wxa

```html
<script>
import {App} from '@wxa/core';

@App
export default class Main {
    globalData = {
        userInfo: 'Genuifx',
    }
}
</script>

<config>
{
    "pages": [
        "pages/index"
    ]
}
</config>

<style lang="scss">
page {
    width: 100%;
    height: 100%;
}
</style>

```

#### pages/index.wxa

```javascript
<script>
import {Page, Mixins, Debounce} from '@wxa/core';
import fooMixin from '../mixins/foo.js';

//定义页面，添加Mixins
@Page
@Mixins(fooMixin)
export default class Index {
    data = {
        formA: {
            org: 'fintech',
            name: 'wxa'
        }
    }

    async onLoad() {
        console.log('Hello World')    
    }

    // 函数防抖
    @Debounce(300)
    sumbitA(e) {
        console.log('submit success!');
    }
}
</script>

<config>
{
    "navigationBarTitleText": "Hello Wxa"
}
</config>

<template>
    <view class="page">
        Hi, <input type="text" value="{{formA.name}}" />
        <button bindtap="sumbitA">提交</button>
    </view>
</template>

<style lang="scss">
.page {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
}
</style>
```

默认导出的方法将会自动调用小程序相应的 `Page`、 `Component`、 `App` 方法进行注册。

更完善的[文档](https://wxajs.gitee.io/wxa/)

**极速预览小程序**

```bash
wxa2 cli --action preview
```


## 技术特点

wxa 是一个 AOP 框架，主要使用 Decorator（运行时改写，拦截）和预编译实现框架功能。

使用 Decorator 实现了：

:white_check_mark: `Fetch` 队列管理网络请求，单个请求自动防重。

:white_check_mark: `Router` 简洁的 API、预加载特性。

:white_check_mark: `Lock` 防止重复执行函数，前端防重利器。

:white_check_mark: `Debounnce` 防抖动。

:white_check_mark: `Mixin` 混合代码，代码复用。

查看详细的 [Class Decorators](https://wxajs.gitee.io/wxa/core/API.html#decorators-%E7%B1%BB%E8%A3%85%E9%A5%B0%E5%99%A8)

预编译方面，实现了对小程序项目的依赖解析，利用依赖树对整个项目进行管理，以此为基础适配了`npm`、单文件开发、云开发、三方开发。开发语法方面支持最新的 ES\*语法（包括 Async/Await）、Sass/Scss、Stylus，有需求的话可以适配更多语法。


## wxa生态

|包名|描述|版本
|-----|----|----|
|@wxa2/core|wxa运行时核心|[![npm version](https://badge.fury.io/js/%40mpxjs%2Fcore.svg)](https://badge.fury.io/js/%40mpxjs%2Fcore)
|@wxa2/cli|wxa编译时与命令行工具|
|@wxa2/mobx|wxa引入mobx|
|@wxa2/redux|wxa引入redux|
|@wxa2/wxa-plugin-bind-hijack|劫持小程序bind事件插件|




## Contribution

欢迎各种 `PR` 和 `ISSUE`

## LICENSE

[MIT](./LICENSE)
