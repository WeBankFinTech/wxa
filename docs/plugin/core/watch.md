# @wxa/watch
[![NPM version](https://img.shields.io/npm/v/@wxa/watch/latest.svg)](https://www.npmjs.com/package/@wxa/watch)
![npm bundle size (minified + gzip)](https://img.shields.io/bundlephobia/minzip/@wxa/watch/latest.svg)

watch插件基于[`melanke-watchjs`](https://github.com/melanke/Watch.JS/)实现，本插件只是简单包装，以适配小程序环境。

## 安装
``` bash
# 使用npm安装
npm i -S @wxa/watch
```

## 用例
1. 在`app.js`/`app.wxa`中引入后注册。
``` js
// app.js or app.wxa
import {App, wxa} from '@wxa/core';
import watchPlugin from '@wxa/watch';

wxa.use(watchPlugin);

@App
export default class Main {};
```

2. 在页面类中定义`watch`对象，指定需要监听的数据。
``` js
import {Page} from '@wxa/core';

@Page
export default class Index {
    data = {
        formData: {
            name: '',
            email: ''
        }
    }
    watch = {
        formData(newValue) {
            // 判断表单数据是否为空
            let isValid = !!Object.keys(newValue).find((key)=>!newValue[key]);
            this.setData({isValid})
        }
    }
}
```

使用watch，我们可以替代一部分`.wxs`的能力，实现类似`computed`的特性。

::: warning 注意
数据监听只对提前定义在data中的数据有效，后续动态添加的数据都无法监听，比如例子中的`isValid`。

可以监听数组本身，但不能监听数组新增的项。
:::
