# CORE

![NpmLicense](https://img.shields.io/npm/l/@wxa/core.svg)
[![NPM version](https://img.shields.io/npm/v/@wxa/core/latest.svg)](https://www.npmjs.com/package/@wxa/core)
![npm bundle size (minified + gzip)](https://img.shields.io/bundlephobia/minzip/@wxa/core/latest.svg)
[![Travis](https://travis-ci.org/wxajs/wxa.svg?branch=master)](https://travis-ci.org/wxajs/wxa)


`@wxa/core`是一个非常小巧的包，提供了网络请求、缓存操作、事件总线、Mixins等能力。

`core`通过新增一个生命周期函数`beforeRouteEnter`，使得开发者可以快速实现**预加载**特性。

对于数据量较大的情况，通过提供一个内置的`$diff`，数据进行diff和flatten操作后再调用`setData`，减少每次传递的数据量，提高`setData`性能。:airplane:

`core`可以单独使用，但是一般推荐配合[`@wxa/cli2`](../cli/)一起使用，体验更佳:kissing:

## 特性
- :white_check_mark: **Fetch** 自动防重，自动队列管理的网络请求方法。
- :white_check_mark: **Router** 简洁的跳转API，实现预加载的关键。
- :white_check_mark: **Eventbus** 跨页面，跨组件交互的简单方案。
- :white_check_mark: **Mixins** 混合，跨页面、跨组件复用逻辑。
- :white_check_mark: **Diff** 增量设置数据。
- :white_check_mark: **Storage** 小程序持久化缓存数据。
- :white_check_mark: **SessionStorage** 应用周期内缓存数据。

## 安装
```bash
# 使用npm安装
npm i @wxa/core
```

## 用例
``` js
import {Page, Lock, Debounce} from '@wxa/core';

// Page装饰器，相当于引入Router、Storage、Fetch等装饰器
@Page
export default class Index {
    async onLoad() {
        let slogan = await this.foo();
    }

    async foo() {
        return await Promise.resolve('Hey, Async/Await is usabled');
    }

    @Lock
    @Debounce 
    tap({detail: {value}}) {
        return this.$fetch('/log', {value});
    }
}
```