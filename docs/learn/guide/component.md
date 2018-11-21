# 自定义组件

与`wepy`自定义组件思路不同的是，`@wxa`完全采用小程序提供的组件化方案。

我们认为采用原生的自定义组件至少有以下几点好处：
- 官方支持
- 运行时独立上下文
- UI框架支持

默认条件下，一个原生的自定义组件可以直接在`wxa`项目中运行，而无需任何额外的配置，编译。

但是，如果项目中的组件想要使用wxa的插件功能，比方说`redux`的数据同步，那么这个组件需要按照`wxa`要求：导出默认的组件实例对象或者类。

## 原生组件
引入一个原生组件和小程序原生开发一模一样，只需要在页面或者组件的配置json中指定`usingComponents`即可。参考[微信自定义组件](https://developers.weixin.qq.com/miniprogram/dev/framework/custom-component/)

在`.wxa`格式的文件中配置也是一样的：

``` vue
<template>
    <email></email>
</template>
<script>
export default class Index {}
</script>
<config>
{
    "usingComponents": {
        "email": "path/to/your/component"
    }
}
</config>
```

## 使用wxa编写组件
要使用wxa编写自定义组件跟开发普通的页面没有太大的区别，只需要新建一个`.wxa`的文件，然后在`config`中配置`component: true`即可。
```vue
<config>
{
    "component": true
}
</config>
```

在逻辑层，我们需要**导出**一个组件实例对象或者类。

```vue
<script>
export default class Center {
    properties = {
        direction: {
            value: 'row',
            type: String,
        },
    }
    ready() {
        this.setData({mainPanel: `flex-direction:${this.data.direction}`});
    }
}
</script>
```

这样，我们就完成了一个简单的自定义组件的编写，后续可以发布到npm上跟更多开发者分享你的代码。在[这儿](https://github.com/Genuifx/wxa-ui/blob/master/src/components/center.wxa)可以看到详细的例子。

::: tip 提示
可以使用`Router`，`Wxapi`等提供的装饰器来增强组件的实例。

虽然wxa提供了mixin功能，但是自定义组件官方支持`behaviors`（类似mixins的代码复用）逻辑，可以考虑优先使用`behaviors`实现~
:::

## 使用第三方组件
利用[`@wxa/cli`](../cli/)我们可以超级方便的引用任何第三方的组件！:confetti_ball:

譬如我们想在项目中使用有赞UI，我们可以先运行`npm i vant-weapp`安装有赞ui组件。然后在项目json配置文件中直接引用即可：

```json
{
    "usingComponents": {
        "counting": "vant-weapp/dist/checkbox/index"
    }
}
```

编译后的结果为：

```json
{
    "usingComponents": {
        "counting": "./../npm/vant-weapp/dist/checkbox/index"
    }
}
```

wxa将会自动的编译对应的组件及其依赖。

::: tip wxa-templates
创建项目的时候可以直接使用[vant](https://github.com/Genuifx/wxa-templates/tree/master/vant)的模板~，高效简洁
:::