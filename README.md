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

轻量级的渐进式小程序开发框架，专注于小程序原生开发，提供更好的工程化、代码复用能力，提高开发效率并改善开发体验。

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

More detail [Documents](https://webank.gitee.io/wxa/)

更完善的[文档](https://webank.gitee.io/wxa/)


## 安装使用

使用 `yarn` 或 `npm` 全局安装

```bash
npm i -g @wxa/cli2
```

**极速新建项目**

```bash
wxa2 create
```

**启动开发环境**

```bash
wxa2 build --watch
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

```vue
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

更完善的[文档](https://webank.gitee.io/wxa/)

**极速预览小程序**

```bash
wxa2 cli --action preview
```


## 技术特点

wxa 是一个 AOP 框架，主要使用 Decorator（运行时改写，拦截）和预编译实现框架功能。

使用 Decorator 实现了：

- :white_check_mark:  **`Fetch`** 自动防重，自动队列管理的网络请求方法。
- :white_check_mark:  **`Router`** 简洁的 API、预加载特性。
- :white_check_mark:  **`Eventbus`** 跨页面，跨组件交互的简单方案。
- :white_check_mark:  **`Mixins`** 混合，跨页面、跨组件复用逻辑。
- :white_check_mark:  **`Diff`** 增量设置数据。
- :white_check_mark:  **`Storage`** 小程序持久化缓存数据。
- :white_check_mark:  **`SessionStorage`** 应用周期内缓存数据。
- :white_check_mark:  **`Lock`** 防止重复执行函数，前端防重利器。
- :white_check_mark:  **`Debounnce`** 防抖动。


查看详细的 [Class Decorators](https://webank.gitee.io/wxa/core/API.html#decorators-%E7%B1%BB%E8%A3%85%E9%A5%B0%E5%99%A8)

预编译方面，实现了对小程序项目的依赖解析，利用依赖树对整个项目进行管理，以此为基础适配了`npm`、单文件开发、云开发、三方开发。开发语法方面支持最新的 ES\*语法（包括 Async/Await）、Sass/Scss、Stylus，有需求的话可以适配更多语法。


## wxa生态

|包名|描述|版本
|-----|----|----|
|@wxa/core|wxa运行时核心|![](https://img.shields.io/npm/v/@wxa/core.svg?label=NPM&color=brightGreen&style=flat-square&logo=npm)
|@wxa/cli2|wxa编译时与命令行工具|![](https://img.shields.io/npm/v/@wxa/cli2.svg?label=NPM&color=brightGreen&style=flat-square&logo=npm)
|@wxa/validate|表单验证、支持自定义校验规则和提示|![](https://img.shields.io/npm/v/@wxa/validate.svg?label=NPM&color=brightGreen&style=flat-square&logo=npm)
|@wxa/watch| watch & computed |![](https://img.shields.io/npm/v/@wxa/watch.svg?label=NPM&color=brightGreen&style=flat-square&logo=npm)
|@wxa/log| 小程序实时日志上报 |![](https://img.shields.io/npm/v/@wxa/log.svg?label=NPM&color=brightGreen&style=flat-square&logo=npm)
|@wxa/mobx|wxa引入mobx|![](https://img.shields.io/npm/v/@wxa/mobx.svg?label=NPM&color=brightGreen&style=flat-square&logo=npm)
|@wxa/redux|wxa引入redux|![](https://img.shields.io/npm/v/@wxa/redux.svg?label=NPM&color=brightGreen&style=flat-square&logo=npm)
|@wxa/plugin-uglifyjs| 压缩美化 Javascript 代码 |![](https://img.shields.io/npm/v/@wxa/plugin-uglifyjs.svg?label=NPM&color=brightGreen&style=flat-square&logo=npm)
|@wxa/plugin-replace| 任意字符替换，用于生产测试参数替换 |![](https://img.shields.io/npm/v/@wxa/plugin-replace.svg?label=NPM&color=brightGreen&style=flat-square&logo=npm)
|@wxa/plugin-copy| 复制指定静态资源 |![](https://img.shields.io/npm/v/@wxa/plugin-copy.svg?label=NPM&color=brightGreen&style=flat-square&logo=npm)
|@wxa/plugin-bind-hijack| 劫持小程序bind事件插件 |![](https://img.shields.io/npm/v/@wxa/plugin-bind-hijack.svg?label=NPM&color=brightGreen&style=flat-square&logo=npm)
|@wxa/plugin-minify-wxml| wxml 压缩 |![](https://img.shields.io/npm/v/@wxa/plugin-minify-wxml.svg?label=NPM&color=brightGreen&style=flat-square&logo=npm)
|@wxa/plugin-postcss| 自定义需要引入的postcss插件 |![](https://img.shields.io/npm/v/@wxa/plugin-postcss.svg?label=NPM&color=brightGreen&style=flat-square&logo=npm)
|@wxa/plugin-dependencies-analysis| 项目构建后的模块依赖关系、体积大小等信息可视化, 方便分析项目的优化空间。|![](https://img.shields.io/badge/Status-Outdated.-orange?style=flat-square)
| [wxa-vscode](https://github.com/WeBankFinTech/wxa-vscode) | vscode 插件。开箱即用，安装完毕你将获得：代码自动填充、格式化; 语法高亮、检查（包括wxml、wxs文件）; 代码片段提示; 单文件组件支持 |![](https://img.shields.io/badge/-extension.-brightGreen?style=flat-square)


## 社区微信群

<img src="./640.jpg" width="380px" height="460px" />

社群二维码过期可联络

邮箱 junbiaoli@webank.com、iveswen@webank.com

项目负责人微信 szyshangzhiyuan （加好友请备注：wxa） 

## Contributors ✨

Thanks goes to these wonderful people ([emoji key](https://allcontributors.org/docs/en/emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tr>
    <td align="center"><a href="https://genuifx.github.io/"><img src="https://avatars2.githubusercontent.com/u/10156994?v=4?s=100" width="100px;" alt=""/><br /><sub><b>WZT</b></sub></a><br /><a href="https://github.com/wxajs/wxa/commits?author=Genuifx" title="Code">💻</a> <a href="#maintenance-Genuifx" title="Maintenance">🚧</a></td>
    <td align="center"><a href="https://github.com/biaodoit"><img src="https://avatars1.githubusercontent.com/u/2704629?v=4?s=100" width="100px;" alt=""/><br /><sub><b>biaodoit</b></sub></a><br /><a href="https://github.com/wxajs/wxa/commits?author=biaodoit" title="Code">💻</a> <a href="#maintenance-biaodoit" title="Maintenance">🚧</a></td>
    <td align="center"><a href="http://www.szy321.com/"><img src="https://avatars2.githubusercontent.com/u/12182232?v=4?s=100" width="100px;" alt=""/><br /><sub><b>shangzy</b></sub></a><br /><a href="https://github.com/wxajs/wxa/commits?author=szYuan" title="Code">💻</a> <a href="#maintenance-szYuan" title="Maintenance">🚧</a></td>
    <td align="center"><a href="https://github.com/hm-fannie"><img src="https://avatars3.githubusercontent.com/u/6054788?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Min Huang</b></sub></a><br /><a href="https://github.com/wxajs/wxa/commits?author=hm-fannie" title="Code">💻</a> <a href="#maintenance-hm-fannie" title="Maintenance">🚧</a></td>
    <td align="center"><a href="https://github.com/lucaszhu2zgf"><img src="https://avatars3.githubusercontent.com/u/2087827?v=4?s=100" width="100px;" alt=""/><br /><sub><b>lucaszhu</b></sub></a><br /><a href="https://github.com/wxajs/wxa/commits?author=lucaszhu2zgf" title="Code">💻</a> <a href="#maintenance-lucaszhu2zgf" title="Maintenance">🚧</a></td>
    <td align="center"><a href="https://github.com/liuhang8023"><img src="https://avatars2.githubusercontent.com/u/24379224?v=4?s=100" width="100px;" alt=""/><br /><sub><b>hughliu</b></sub></a><br /><a href="https://github.com/wxajs/wxa/commits?author=liuhang8023" title="Code">💻</a> <a href="#maintenance-liuhang8023" title="Maintenance">🚧</a></td>
    <td align="center"><a href="https://github.com/FlyDaisy"><img src="https://avatars0.githubusercontent.com/u/33273144?v=4?s=100" width="100px;" alt=""/><br /><sub><b>FlyDaisy</b></sub></a><br /><a href="https://github.com/wxajs/wxa/commits?author=FlyDaisy" title="Code">💻</a> <a href="#maintenance-FlyDaisy" title="Maintenance">🚧</a></td>
  </tr>
  <tr>
    <td align="center"><a href="https://zacharykwan.com/"><img src="https://avatars0.githubusercontent.com/u/11681043?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Zachary Kwan</b></sub></a><br /><a href="https://github.com/wxajs/wxa/commits?author=zehuiguan" title="Code">💻</a></td>
    <td align="center"><a href="https://segmentfault.com/u/alan"><img src="https://avatars0.githubusercontent.com/u/1666185?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Alan Zhang</b></sub></a><br /><a href="https://github.com/wxajs/wxa/commits?author=zcfan" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/hanzooo"><img src="https://avatars0.githubusercontent.com/u/16368939?v=4?s=100" width="100px;" alt=""/><br /><sub><b>hanzooo</b></sub></a><br /><a href="https://github.com/wxajs/wxa/commits?author=hanzooo" title="Code">💻</a></td>
  </tr>
</table>

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/all-contributors/all-contributors) specification. Contributions of any kind welcome!


## LICENSE

[MIT](./LICENSE)
