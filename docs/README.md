---
home: true
heroImage: /wxa-logo.png
actionText: Get Started ->
actionLink: /learn/guide/
features: 
- title: Decorator
  details: 使用Decorator极速赋能小程序，提高开发效率，优化开发体验
- title: 工程化
  details: 完美解析npm依赖，打包、编译、压缩资源文件，用最高效的代码完成业务需求
- title: 第三方组件
  details: 支持原生自定义组件的同时，允许开发者直接从node_modules中引用任何第三方自定义组件
- title: 多开发模式
  details: 同时支持类Vue单文件和小程序原生开发
- title: Async/Await
  details: 使用@babel7转义语法，开发者可以使用最新的ES特性语法
- title: 三方开发
  details: 适配三方开发，允许一次性编译出多个三方小程序
footer: MIT Licensed | Copyright © 2018-present Genuifx
---

### 简洁明了的API

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