# 计算属性和数据监听

小程序模板语言中不允许使用函数表达式，这也就意味着我们无法使用函数动态计算模板。例如：

```html
<view id="example">
  {{ message.join('、') }}
</view>
```

虽然无法直接使用函数表达式，但是我们可以通过小程序独有的 [`WXS`](https://developers.weixin.qq.com/miniprogram/dev/framework/view/wxs/) 语法来实现类似的效果。例如：

```html
<wxs module="m1">
var join = function(array) {
  return array.join('、');
}

module.exports.join = join;
</wxs>

<view> {{m1.join(message)}} </view>
```

虽然 `wxs` 可以满足需求，但是编写起来比较麻烦，比如仅支持 ES5 的语法，特定的 API。此时我们可以就使用计算属性来优化我们的代码。

## 开始使用

由于小程序的单向数据流已经能满足绝大部分场景，所以在 `@wxa/core` 中并没有内置关于数据监听的逻辑，所以再开始使用之前需要安装 `@wxa/watch`.

``` shell
npm i -S @wxa/watch
```

接着只需要在 `app.wxa` 中注册组件即可：

```js
import {wxa} from '@wxa/core';
import wxaWatch from '@wxa/watch';

wxa.use(wxaWatch);
```

此时使用 wxa 注册的所有页面和组件将自动获得数据监听和计算属性两个新的能力。

## 计算属性

我们只需要在实例或者类声明中加上 `computed` 对象，插件将在页面和组件实例化的过程中自动的设置对应的 `computed` 数据。需要注意的是，由于小程序环境对 `Proxy` 的支持还不够好，所以现阶段使用的还是 `Object.defineProperty` 使用的数据监听，故需要响应式更新的数据应提前在 data 中声明。

``` vue
<template>
    <view id="example">
        <view>Original message: "{{ message }}"</view>
        <view>Computed message: "{{ computedMessage }}"</view>
    </view>
</template>
<script>
export default class {
    data =  {
        message: 'Hello'
    }

    computed = {
        computedMessage() {
            return this.data.message + ' World'
        }
    }
}
</script>
```

使用起来非常方便。


## 数据监听

在开发表单的过程中，我们经常需要联动判断表单状态，例如下面的简单示例：

```vue
<template>
    <input value="{{formData.name}}" />
    <input value="{{formData.email}}" />
    <button disabled="{{!isValid}}">确认提交</button> 
</template>
<script>
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
</script>
```

当表单填写完毕之后，提交按钮高亮提交，很简单不是吗~
