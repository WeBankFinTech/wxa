# 自定义组件
原生的自定义组件可以直接在`@wxa/cli`下运行编译，为了提高开发效率，我们也为自定义组件的开发提供了`launchComponent`方法，用于增强组件能力。

## 使用wxa编写自定义组件
要使用wxa编写自定义组件跟开发普通的页面没有太大的区别，只需要新建一个`.wxa`的文件，然后在`config`中配置`component: true`即可。
```vue
<config>
{
    "component": true
}
</config>
```
为了让`wxa插件`的逻辑能够处理到组件层，我们需要使用`lauchComponent`实例化组件。
```vue
<script>
import {wxa} from '@wxa/core';

class Center {
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

wxa.launchComponent(Center);
</script>
```
这样，我们就完成了一个简单的自定义组件的编写，后续可以发布到npm上跟更多开发者分享你的代码。在[这儿](https://github.com/Genuifx/wxa-ui/blob/master/src/components/center.wxa)可以看到详细的例子。
::: tip 提示
可以使用`Router`，`Wxapi`等wxa提供的装饰器来增强组件的实例。
:::

::: warning 注意
由于自定义组件官方支持`behaviors`（类似mixins的代码复用）逻辑，故wxa不提供额外的mixin功能。
:::

## 引入第三方组件
有的时候我们需要从npm引入第三方的组件，这个时候我们可以直接从`node_modules`引入对应组件

```json
// in your page's config.json
{
    "usingComponents": {
        "counting": "@wxa/ui/src/components/counting"
    }
}
```
编译后的结果为：
```json
{
    "usingComponents": {
        "counting": "./../npm/@wxa/ui/src/components/counting"
    }
}
```
wxa会把组件的对应的`.wxml`,`.json`,`.js`和`.json`文件复制到指定的目录。