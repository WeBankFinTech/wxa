---
home: true
heroImage: /wxajs.svg
actionText: 开始使用
actionLink: /learn/quickStarted/
actionRepo: GitHub
actionRepoLink: https://github.com/WeBankFinTech/wxa
search: false
features: 
- title: 🚀 极速上手
  details: 贴合原生小程序开发，可以完全使用原生小程序语法开发。
- title: 📦 工程化
  details: 完美解析 NPM 依赖，打包、编译、压缩资源文件，用最高效的代码完成业务需求
- title: 🤖 组件库
  details: 推荐使用原生自定义组件，允许开发者直接从 node_modules 中引用任意第三方组件库，完美适配 weui, vant-weapp, wux-weapp, iview-weapp 等组件库。
- title: ➰ 依赖分包算法
  details: 自研的依赖分包算法，帮助开发者充分的利用分包空间
- title: 🏄 Async/Await
  details: 使用@babel7转义语法，开发者可以使用最新的ES特性语法
- title: 👽 三方开发
  details: 适配三方开发，允许一次性编译出多个三方项目或其他平台的小程序，如头条小程序。
footer: MIT Licensed | Copyright © 2018-present @webank
---

## 简洁明了的API

```vue
<!-- app.wxa -->
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

> 默认导出的方法将会自动调用小程序相应的 `Page`、 `Component`、 `App` 方法进行注册。
