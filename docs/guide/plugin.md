# 插件机制
`wxa`提供了一套插件机制，通过插件可以处理到所有通过`wxa.launchApp`，`wxa.launchPage`和`wxa.launchComponent`注册的实例。你可以使用插件编写自己的全局规范，给每个实例插入自己的业务方法。

## 编写一个插件
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
然后我们只需要在`app.js`或者`app.wxa`中注册组件即可
```javascript
import logger from 'path/to/your/plugin'

// 调用use方法注册组件
wxa.use(logger, {});

wxa.launchApp({})
```

::: tip 提示
插件将拿到当前实例`vm`, 以及实例的类型`App`，`Page`，`Component`。
:::