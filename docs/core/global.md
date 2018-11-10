# 全局API

## 配置
### wxa.setMaxRequest( number )
- **参数**: 
    - **number** `Number` **Default**: 5
- **用例**:
```javascript
// app.js
import {wxa} from '@wxa/core'

// 最大并发4个请求，多余请求在队列排队等待
wxa.setMaxRequest(4);
```

设置最多同时并发的网络请求。

微信`wx.request`接口最多同时并发10个请求，超过10个请求将会被抛弃。wxa提供了一层request包装，引入队列控制并发请求。小程序业务层可以不关心并发多少个请求的问题，wxa将会保证每个请求都发出去。

::: warning 注意
最大并发请求不应该设置超过10    
超过最大并发的请求都会在队列等待其他请求完成后按顺序发出
:::

### wxa.setRequestExpiredTime( ms )
- **参数**: 
    - **ms**: `Number` 毫秒 **Default**: 500ms
- **用例**:

```javascript
// app.js
import {wxa} from '@wxa/core'

wxa.setRequestExpiredTime(1000);
```

设置post请求失效缓存失效时间。

使用wxa的`fetch`方法发送网络请求，wxa会缓存每个post请求，当客户端在一定时间内连续发送同一个请求的时候，wxa会主动reject并返回`{code: -101}`。相当于做一层前端post请求防重复。

::: warning 注意
wxa的前端防重机制大部分时间下可以很好的处理绝大多数请求重复的case。但是如果业务比较复杂，例如遇到多异步请求的事务性业务的时候，http层的请求防重并不能解决问题，wxa另外提供了一个`Lock`装饰器来处理这种情况。
:::


### wxa.addNoPromiseApi( name )
- **参数**: 
    - **name**: `[String, Array]`
- **用例**:
```javascript
import {wxa} from '@wxa/core'

wxa.addNoPromiseApi('getRecorderManager');

wxa.addNoPromiseApi(['uploadFile', 'nextTick']);
```

wxa尝试为所有`wx.**`的方法做一次promise化，但是有一些同步的api却不应该这么做，因为他们会直接返回某个句柄或者结果值，如果为他们做了promise化，这些返回将会被损失。

### wxa.setDebugMode( mode )
- **参数**: 
    - **mode**: `false`
- **用例**: 
```javascript
import {wxa} from '@wxa/core';

wxa.setDebugMode(true)
```
debug模式，wxa会打印更详细的debug信息用于调试，项目上线后请关闭该选项。

## 注册
::: tip 提示
使用@wxa/cli2可以不需要手动调用这些注册，直接导出对应类即可，cli会通过注入脚本，自动调用该方法。
示例：
```javascript
// app.wxa 使用cli2编译项目
import {App} from '@wxa/core';

@App
export default class App {
    // your logic here.
}
```
:::
### wxa.launchApp( instance )
- **参数**:
    - **instance** `[Object, Array]` 小程序App类或者对象实例
- **用例**:
```javascript
// app.js / app.wxa
import {wxa} from '@wxa/core';

// 传递一个App对象
wxa.launchApp({
    globalData: {
        userInfo: {
            name: 'Genuifx'
        }
    }
    // 小程序生命周期函数
    onLaunch(options) {

    }
});

// 传递一个App类
wxa.launchApp(class App {
    globalData = {
        userInfo:  {
            userInfo: {
                name: 'Genuifx'
            }
        }
    }
    // 小程序生命周期函数
    onLaunch(options) {

    }
})
```

注册一个小程序，接受一个类或对象实例，相当于小程序原生开发中显式调用`App()`。

`wxa.launchApp`会在内部调用`App()`函数，并在这之前对实例进行`mixins`处理和插件应用。

::: tip 提示
最佳实践是传递一个类，这样可以享受wxa提供的Decorator的便利。
:::

### wxa.launchPage( instance )
- **参数**:
    - **instance** `[Object, Array]` 小程序页面类或对象实例
- **用例**:
```javascript
// index.js / index.wxa
import {wxa} from '@wxa/core';

// 传递一个App类
wxa.launchPage(
    class Index {
        data = {
            name: 'Genuifx'
        }
        // 小程序生命周期函数
        onLoad(options) {}
        // 页面事件响应函数
        async tap() {
            await new Promise((resolve)=>setTimeout(resolve, 1000));
        }
    }
)
```

注册一个小程序页面，接受一个类或对象实例，相当于小程序原生开发中显式调用`Page()`。

`wxa.launchPage`会为加载全局和局部`mixins`、添加`$go`和`$diff`函数到页面实例，最后应用插件到实例。


### wxa.launchComponent( instance )
- **参数**:
    - **instance** `[Object, Array]` 小程序自定义组件类或对象实例
- **用例**:
```javascript
// index.js / index.wxa
import {wxa} from '@wxa/core';

// 传递一个App类
wxa.launchComponent(
    class Popup {
        properties = {
            text: String
        }
        data = {
            name: 'Genuifx'
        }
        // 小程序组件生命周期函数
        attached() {}
        // 组件事件响应函数
        async tap() {
            await new Promise((resolve)=>setTimeout(resolve, 1000));
        }
    }
)
```

注册一个小程序自定义组件，接受一个类或对象实例，相当于小程序原生开发中显式调用`Component()`。

`wxa.launchComponent`会为加载全局和局部`mixins`、添加`$diff`函数到页面实例，最后应用插件到实例。


## 混合和插件
### wxa.mixin( mixin )
- **参数**: 
    - **mixin**: `[Class, Object]` 
- **用例**:

添加一个全局mixin，所有页面实例和自定义组件实例都应用到。一般用于挂载项目中常用的函数方法到页面。

### wxa.use( plugin, options )
- **参数**:
    - **plugin**: `Function` 一个高级函数
    - **options**: `Object` 传递给插件的参数
- **用例**: 

```javascript
// app.js
import {wxa} from '@wxa/core';
import watchPlugin from '@wxa/watch'
// 挂载插件
wxa.use(watchPlugin);

// index.js
export default class Index {
    data: {
        formData: {
            name: ''
        }
    }
    watch = {
        // 监听formData.name的变化
        'formData.name'(newValue, oldValue) {
            this.setData({
                valid: !!newValue
            });
        }
    }
}
```

添加一个插件，该插件可以应用到App实例、页面实例和自定义组件实例。插件一般用于实现特定的通用功能，比如`watch`插件，使得小程序也可以监听data数据的变化，做出相应响应，效果和vue的`computed`类似。

