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
  <a href="https://codecov.io/gh/wxajs/wxa">
    <img src="https://codecov.io/gh/wxajs/wxa/branch/master/graph/badge.svg" />
  </a>
  <img alt="node (scoped with tag, custom registry)" src="https://img.shields.io/badge/node-%3E%3D%208.0.0-brightgreen.svg?maxAge=2592000" />
  <img alt="Licence" src="https://img.shields.io/npm/l/@wxa/core.svg" />
</p>

# @wxa

:tada::tada::tada:AOP Framework for writing wechart mini-program.

:100:More detail [documents](https://wxajs.github.io/wxa/)

:100:更完善的[文档](https://wxajs.github.io/wxa/)

## 简介

wxa是一个AOP框架，主要使用Decorator（运行时改写，拦截）和预编译实现框架功能。

Decorator方面实现了网络请求，路由，事件总线等Class Decorator， 针对前端防重、防抖动开发了Lock、Debounce等Method Decorator。此外还支持数据预加载、Mixin、diff特性。

预编译方面，实现了对小程序项目的依赖解析，利用依赖树对整个项目进行管理，以此为基础适配了Npm、单文件开发、三方开发。开发语法方面支持最新的ES*语法（包括Async/Await）、Sass/Scss、Stylus，有需求的话可以适配更多语法。

跟wepy相比有以下优势：
- wxa完全采用原生小程序的组件化方案，2.0已经适配了有赞Vant-weapp和echarts了。
- 超低迁移成本，原生小程序只需要安装好相关依赖就可以马上在@wxa/cli中跑起来。支持原生和wxa混杂开发。
- 三方开发，支持一次性编译出多个三方项目

## Quick Started

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