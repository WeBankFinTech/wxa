# 运行时插件
`@wxa/core`提供了一套运行时的插件机制，用以添加、拦截、改写页面/组件实例。

通过插件，我们可以对所有符合wxa规范的实例进行处理。你可以使用插件编写自己的全局函数，给每个实例插入自己的业务方法。

::: tip wxa规范
即导出默认实例类或对象，或者通过`wxa.launchApp`，`wxa.launchPage`和`wxa.launchComponent`手动注册的所有实例。
:::

## 编写
一个插件即一个js的高级函数，他接收一组插件配置，并返回一个包裹着插件逻辑的函数，wxa生成实例的时候会自动应用每个注册的插件。一个简单的插件如下：

```javascript
// wa是一个日志上报脚本
import wa from 'wa'

export default (options)=>{
    // vm是当前实例，type为实例类型
    return (vm, type)=>{
        // 在页面和App实例中注入logger方法
        // 这样子我们就可以直接通过`this.logger.errorReport`上报错误了
        if(['App', 'Page'].indexOf(type) > -1){
            vm.logger = wa;
        }
    }
}
```

插件函数将接收到实例化完成的组件实例`vm`，以及当前组件是属于什么类型，目前总有三种类型：`App`、`Page`、`Component`。

## 应用

应用一个插件非常简单，我们只需要在`app.js`或者`app.wxa`中声明即可：

``` js
// app.js app.wxa
import logger from 'path/to/your/plugin'

// 调用use方法注册组件
wxa.use(logger, {});

export default class App{};
```

至此，一个简单的运行时插件就完成。

::: tip 提示
插件将拿到当前实例`vm`, 以及实例的类型`App`，`Page`，`Component`。
:::