---
title: API
type: api
---

## 全局API

### wxa.setMaxRequest

`wxa.setMaxRequest( number )`

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

### wxa.setRequestExpiredTime

`wxa.setRequestExpiredTime( ms )`

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


### wxa.addNoPromiseApi

`wxa.addNoPromiseApi( name )`

- **参数**: 
    - **name**: `[String, Array]`
- **用例**:
```javascript
import {wxa} from '@wxa/core'

wxa.addNoPromiseApi('getRecorderManager');

wxa.addNoPromiseApi(['uploadFile', 'nextTick']);
```

wxa尝试为所有`wx.**`的方法做一次promise化，但是有一些同步的api却不应该这么做，因为他们会直接返回某个句柄或者结果值，如果为他们做了promise化，这些返回将会被损失。

### wxa.setDebugMode

`wxa.setDebugMode( mode )`

- **参数**: 
    - **mode**: `false`
- **用例**: 
```javascript
import {wxa} from '@wxa/core';

wxa.setDebugMode(true)
```
debug模式，wxa会打印更详细的debug信息用于调试，项目上线后请关闭该选项。

### wxa.launchApp

`wxa.launchApp( instance )`

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

### wxa.launchPage

`wxa.launchPage( instance )`

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


### wxa.launchComponent

`wxa.launchComponent( instance )`

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

::: tip 提示
使用@wxa/cli2可以不需要手动调用这些注册方法，直接导出对应类即可，cli会通过注入脚本，自动调用该方法。
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

### wxa.mixin

`wxa.mixin( mixin )`

- **参数**: 
    - **mixin**: `[Class, Object]` 
- **用例**:

添加一个全局mixin，所有页面实例和自定义组件实例都应用到。一般用于挂载项目中常用的函数方法到页面。

### wxa.use

`wxa.use( plugin, options )`

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


### wxa.disabledAppEmbed

`wxa.disabledAppEmbed()`

- **用例**: 
```javascript
import {wxa} from '@wxa/core';
wxa.disabledAppEmbed()
```
取消自动注入`$app`对象

### wxa.getWxaPlatform

`wxa.getWxaPlatform()`
- **返回值**: `String` 当前小程序运行的平台类型, `wechat` 微信小程序、 `tt` 头条小程序

- **用例**: 
```javascript
import {wxa, Page} from '@wxa/core';

@Page
export default class {
    onLoad() {
        if(wxa.getWxaPlatform() === 'tt') {
            // 头条小程序
        } else {
            // 微信小程序
        }
    }
}
```

用于编写跨平台小程序代码使用

## 选项 / 页面生命周期

### beforeRouteEnter

- **类型**: `Function`
- **用法**：

在路由开始跳转，页面实例化之前被执行。即拿不到页面实例，也访问不到任何页面实例数据。

::: tip 提示
`beforeRouteEnter`是wxa框架特有的生命周期，必须使用`router.*`方法压栈的方法才会触发。

利用`beforeRouteEnter`, 可以实现小程序页面数据的预加载。
:::


### onLoad 
onLoad(Object query)
页面加载时触发。一个页面只会调用一次，可以在 onLoad 的参数中获取打开当前页面路径中的参数。

参数：

|名称|类型|说明|
|-|-|-|
|query|Object|打开当前页面路径中的参数|

### onShow
页面显示/切入前台时触发。

### onReady
页面初次渲染完成时触发。一个页面只会调用一次，代表页面已经准备妥当，可以和视图层进行交互。

注意：对界面内容进行设置的 API 如wx.setNavigationBarTitle，请在onReady之后进行。详见生命周期

### onHide
页面隐藏/切入后台时触发。 如 wx.navigateTo 或底部 tab 切换到其他页面，小程序切入后台等。

### onUnload
页面卸载时触发。如wx.redirectTo或wx.navigateBack到其他页面时。

::: tip 提示
原生小程序所有生命周期回调函数都不变，具体请查看
- [页面生命周期](https://developers.weixin.qq.com/miniprogram/dev/framework/app-service/page.html#%E7%94%9F%E5%91%BD%E5%91%A8%E6%9C%9F%E5%9B%9E%E8%B0%83%E5%87%BD%E6%95%B0)
- [自定义组件生命周期](https://developers.weixin.qq.com/miniprogram/dev/framework/custom-component/component.html)
:::

## 选项 / APP生命周期

> 官方文档：[App生命周期](https://developers.weixin.qq.com/miniprogram/dev/framework/app-service/app.html)

### onLaunch
小程序初始化完成时触发，全局只触发一次。参数也可以使用 wx.getLaunchOptionsSync 获取。

参数：与 wx.getLaunchOptionsSync 一致

### onShow
小程序启动，或从后台进入前台显示时触发。也可以使用 wx.onAppShow 绑定监听。

参数：与 wx.onAppShow 一致

### onHide
小程序从前台进入后台时触发。也可以使用 wx.onAppHide 绑定监听。

### onError
小程序发生脚本错误或 API 调用报错时触发。也可以使用 wx.onError 绑定监听。

参数：与 wx.onError 一致

### onPageNotFound
基础库 1.9.90 开始支持，低版本需做兼容处理。

小程序要打开的页面不存在时触发。也可以使用 wx.onPageNotFound 绑定监听。注意事项请参考 wx.onPageNotFound。

参数：与 wx.onPageNotFound 一致
```js
App({
  onPageNotFound(res) {
    wx.redirectTo({
      url: 'pages/...'
    }) // 如果是 tabbar 页面，请使用 wx.switchTab
  }
})

```

### onUnhandledRejection
基础库 2.10.0 开始支持，低版本需做兼容处理。

小程序有未处理的 Promise 拒绝时触发。也可以使用 wx.onUnhandledRejection 绑定监听。注意事项请参考 wx.onUnhandledRejection。

参数：与 wx.onUnhandledRejection 一致

### onThemeChange
基础库 2.11.0 开始支持，低版本需做兼容处理。

系统切换主题时触发。也可以使用 wx.onThemeChange 绑定监听。

参数：与 wx.onThemeChange 一致





## 实例 / property

### vm.$diff
`vm.$diff( newData, cb)`

- **参数**: 
    - **newData**: `Object` 更新的数据
    - **cb**: `Function` setData引起的界面更新渲染完毕后的回调函数
- **用例**:

对更新的数据进行`diff`，然后根据小程序setData的特性进行`flatten`处理之后，在调用setData设置数据，以得到增量更新的效果，对于大的Object而言有很好效益，提高setData效率，减少重绘。

### vm.$go

`vm.$go( event )`

- **参数**：
    - **event**：小程序事件回调对象。
- **用例**：
```xml
<!-- 相当于调用this.$router.push('/pages/log') -->
<view bindtap="$go" data-path="/pages/log">去日志页</view>
<!-- 相当于调用this.$router.replace('/pages/log') -->
<view bindtap="$go" data-type="replace" data-path="/pages/log">去日志页</view>
```
重构阶段可以无需写任何逻辑，快速实现页面之间的跳转。

### vm.$app

`vm.$app` app 实例，等同于相当于调用 `getApp()`


## Decorators / 类装饰器

wxa基于最新的[proposal-decorators](https://github.com/tc39/proposal-decorators/blob/master/METAPROGRAMMING.md), 编写了丰富的类装饰器。通过拦截，改写等方式，对类进行增强。

大部分类装饰器，都提供了单独调用的方法，譬如对应缓存操作，wxa有装饰器`Storage`和单独的`storage`对象。

Decorators方式如下: 

```javascript
import {Storage} from '@wxa/core'

@Storage
class Index {
    foo() {
        this.$storage.get('MSG');
    }
}
```

直接使用: 
```javascript
import {storage} from '@wxa/core'

export default function foo() {
    let abc = storage.get('abc');
}
```

::: tip
类装饰器新增的方法一般都一`$`开头哟~，譬如`$diff`, `$storage`，`$router`等等，这一点与`@wxa/core@1.x`不一致。
:::

由于在实际项目开发中，一般都会用到很多好用的Decorator，于是在其他类装饰器的基础上，wxa又包装了`App`和`Page`装饰器，以满足日常开发需要。


### App
App装饰器是`Utils`, `Storage`, `Wxapi`, `Router`, `Eventbus`, `Fetch`的集合。使用了App装饰器等于同时使用了上述所有功能装饰器。

```javascript
@App
export default class Main {
    async foo() {
        try {
            // 使用fetch获取数据
            await this.$fetch('https://remote/server');
            // 使用router方法跳转路由
            this.$router.push('/pages/log/log');
        } catch(e) {
            console.error(e);
        }
    }
    boo() {
        // 触发一个something happened的事件。
        this.$eventbus.emit('somthing happened', 'Hey Guys!')
    }
}
```

### Page
Page装饰器是`Utils`, `Storage`, `Wxapi`, `Router`, `Eventbus`, `Fetch`的集合。使用了Page装饰器等于同时使用了上述所有功能装饰器。

另外，`Page`装饰器还是自动注入app实例到`$app`上。

```javascript
@Page
export default class Index {
    async foo() {
        // 获取app实例
        if (this.$app.isDEBUG) {
            this.setData({
                name: 'Genuifx'
            })
        }

        //获取远程数据
        let data = await this.$fetch('remote/server');

        console.log(data)
    }
}
```

### Eventbus
在小程序中，跨页面，跨组件的共享状态是一个比较难以解决的问题，全局状态管理方案`@wxa/Redux`可以优雅的解决该问题，除`redux`方案之外，wxa还提供了一个简易的自定义事件管理，允许开发者快速开发跨页面，跨组件的业务需求。

简单示例如下：
```js
// a.js
@Eventbus
class APage {
    boo() {
        // 监听一个事件
        this.$eventbus.on('event', ()=>{});
    }
}

// b.js
@Eventbus
class BPage {
    onShow() {
        // 触发事件
        this.$eventbus.emit('event');
    }
}
```

#### on( name, handler, scope? )
- **参数**
    - **name**: `String` 监听的自定义事件名
    - **handler**: `Function` 回调函数
    - **scope?**: `String` 事件域
- **用例**: 


监听一个自定义事件，当事件触发的时候执行对应回调函数。

#### once( name, handler, scope? )
- **参数**
    - **name**: `String` 监听的自定义事件名
    - **handler**: `Function` 回调函数
    - **scope?**: `String` 事件域
- **用例**: 


一次性监听一个自定义事件，当事件触发的时候执行对应回调函数，执行完毕后取消监听。

#### off( name, handler )
- **参数**
    - **name**: `String` 监听的自定义事件名
    - **handler**: `Function` 对应回调函数
- **用例**: 

取消监听一个自定义事件。

::: tip 提示
在页面被注销的时候记得取消监听事件，避免内存泄漏！

```js
@Page 
class Idx {
    onLoad() {
        this.$eventbus.on('e', this.handler);
    }
    onUnload() {
        this.$eventbus.off('e', this.handler)
    }
    handler() {}
}
```
:::

#### emit( name, payload )
- **参数**
    - **name**: `String` 监听的自定义事件名
    - **payload**: `[Object, String, Number]` 回调函数接受的参数
- **用例**: 

触发一个自定义事件

#### clear( name )
- **参数**
    - **name**: `[String, Null]` 监听的自定义事件名
- **用例**: 

```js
// 注意这么写会清空所有事件
this.$eventbus.clear(); 
// 清楚所有event事件监听
this.$eventbus.clear('event'); 
```

清空指定事件回调，或者清空所有事件回调

### Fetch
`wxa`为网络请求提供了一个好用的`Fetch`装饰器，通过`fetch`，开发者可以快速的发起请求，而不需要担心`wx.request`引发的其他问题。

`fetch`api具有promise化，队列化请求的能力，同时具备对`post`请求的短时间防重。

#### fetch( url, data, configs, method )
- **参数**
    - **url**: `String` 接口地址
    - **data**: `Object` 请求携带的数据
    - **configs**: `Object` 请求的配置
        - **$top**: `Boolean` 高优先级请求，直接压入等待队列的列首
        - **$noCache**: `Boolean` 指定该请求做防重处理
        - **$withCancel**: `Boolean` `default: false` 是否需要主动取消请求，如是则返回一个 `Object`，其中包含 `request` (当前这次请求的 promise) `cancel` 函数，主动执行用于取消该请求。默认直接返回一个 `promise`。
        - 其他小程序默认的配置都放在这里，例如header，dataType，具体参数可以参考[小程序文档](https://developers.weixin.qq.com/miniprogram/dev/api/network/request/wx.request.html)
    - **method**: `String` 请求方式, get, post。
- **用例**: 

```js
@Fetch
class UserInfo {
    async get(){
        let succ = await this.$fetch('/remote/user/get', {}, {}, 'get');
        // other logic
    }
}
```

### Mixins
- **调用方式**
    - `@Mixins( [mixin]+ )`
- **参数**
    - **mixin** 混合对象，可以为Object或者Class。
- **用例**: 

混合多个对象或Class的方法，数据，生命周期到当前App/页面/组件类。data将会做一次deep merge，方法按顺序覆盖，生命周期函数则按顺序执行。
- **参考**:

指南：对象混合

### Router
简洁的路由API，用于跳转小程序路由页面。

::: tip 提示
使用`Router`提供的路由方法跳转，可以享受wxa提供的预加载特性，具体请查看生命周期`beforeRouteEnter`文档。
:::

#### get( )
- **用例**: 
```js
// {_webviewid: 1, route: 'pages/index/index', ...}
let currentPage = this.$router.get(); 
```

获取当前路由页面信息

#### getAll( )
- **用例**: 
```js
// 获取完整的页面栈
let stack = this.$router.getAll();
```

获取当前路由栈，相当于调用了小程序的`getCurrentPages()`。

#### push( path )
- **参数**
    - **path**: `String` 页面路由路径，相对路径或绝对路径
- **用例**: 

```js
// 直接跳转
this.$router.push('/pages/index');

// 跳转完成后做一些特殊处理
try {
    await this.$router.push('/pages/index');
    this.$storage.set('hasTravel', true);
} catch(e){
    toast('跳转失败');
}
```

跳转到新路由页面，入栈路由。

#### replace( path )
- **参数**
    - **path**: `String`
- **用例**: 

关闭当前页面，打开新的指定页面。

#### reLaunch( path )
- **参数**
    - **path**: `String`
- **用例**: 

关闭所有页面栈中的页面，重新打开指定页面。

#### switch( path )
- **参数**
    - **path**: `String`
- **用例**: 

切换tabar页面。

#### go( delta )
- **参数**
    - **delta**: `Number` 回退的页面数
- **用例**: 

回退页面, delta为欲回退页面数。

#### goBack( )
- **用例**: 

回退上一个页面，相当于调用`this.$router.go(-1)`。

#### close( )
- **用例**: 

关闭小程序。

:warning:谨慎调用，将会直接关闭小程序。

::: warning 警告
`this.$router.close()`方法已无法主动关闭小程序。需要关闭小程序请参考以下代码：
```xml 
<navigator target="miniProgram" open-type="exit">关闭小程序</navigator>
```
:::


### Storage

缓存操作。挂载于`this.$storge`, storage方法包装了同步的`wx.storage`方法，提供简洁api。

值得一提的是，storage缓存的数据会做一次`JSON.stringify`操作，在读取数据的时候再做相应的`JSON.parse`后返回。故而storage可以直接缓存非`Primitive Type`的数据，当然函数除外~

::: warning 注意
storage并不能存`Function`类型的数据或带有循环引用的对象。

缓存的数据在删除小程序后会丢失。
:::

示例代码：

```javascript
// Storage Decorator
@Storage
class Center {
    travel() {
        this.$storage.set('keyOfValue', {name: 'Genuifx'});
    }
}
```

#### set( key, value )
- **参数**:
    - **key**: `String`
    - **value**: `Any`
- **用例**: 

同步的缓存数据到storage。

#### get( key )
- **参数** :
    - **key**: `String`
- **用例**:

同步的获取缓存数据。

#### remove( key )
- **参数** :
    - **key**: `String`
- **用例**:

清除指定key的缓存数据。

#### clear( )
- **用例**:

⚠️清除所有的缓存数据。

### SessionStorage

#### set( key, value, scope? )
- **参数**:
    - **key**: `String`
    - **value**: `Any`
    - **scope**: `String` `defaul: 'global'` 可以区分缓存数据位置，默认 `global`
- **用例**: 

#### get( key, scope? )
- **参数** :
    - **key**: `String`
    - **scope**: `String` `defaul: 'global'` 
- **用例**:

#### remove( key, scope? )
- **参数** :
    - **key**: `String`
    - **scope**: `String` `defaul: 'global'`
- **用例**:

清除指定key的缓存数据。

#### clear( scope? )
- **参数** :
    - **scope**: `String` `defaul: 'global'` 传 '*' 将清理全部 scope 下的数据
- **用例**:

清除所有的缓存数据。


### Utils
工具函数集

#### formatDate( timestap, format )
- **参数**
    - **timestap**: `[Number, String]`
    - **format**: `String` 格式化后的时间格式，默认`'yyyy-MM-dd hh:mm:ss'`
- **用例**: 

```js
let dateStr = this.$utils.formatDate(Date.now());
```

格式化时间戳为指定格式的字符串

#### trim( str )
- **参数**
    - **str**: `String`
- **用例**: 

```js
let trimStr = this.$utils.trim(str);
```

由于小程序部分终端不支持`.trim`方法，所以wxa提供了一个补丁方法。

#### compareVersion( v1, v2 )
- **参数**
    - **v1**: `String` version
    - **v2**: `String` version
- **用例**: 
```js
this.utils.compareVersion('1.2.1', '1.1.0'); // 1
this.utils.compareVersion('2.0.7', '2.2.0'); // -1
this.utils.compareVersion('1.1.0', '1.1.0'); // 0
```

小程序官方提供的基础库比较函数。如果v1等于v2则返回0，v1大于v2则返回1，v1小于v2则返回-1。

### Wxapi
尝试对所有`wx.*`的方法做一次`promisify`操作，返回一个异步的小程序函数。开发者可以直接使用promise处理异步问题，也可以搭配`Async/Await`使用。示例如下：

```javascript
// 获取地理位置
let {latitude, longtitude} = await this.$wxapi.getLocation({type: 'wgs84'});
// 扫一扫
let res = await this.$wxapi.scanCode();
// 登录接口
let {code} = await this.$wxapi.login();
```

对于同步的方法，不做任何包装直接返回函数执行结果：

```javascript
// 同步获取手机信息
let value = this.$wxapi.getSystemInfoSync();
// 同步获取小程序更新器句柄
let manager = this.$wxapi.getUpdateManager();
```

::: warning 注意
wxapi对所有微信api一次promise化。其中不会做promisify的方法有：`create*`方法，`on*`， `*Sync`方法和`getUpdateManager`方法。

使用`wxa.addNoPromiseApi`可以手动添加方法，避免被方法被错误的promise化
:::


## Decorators / 方法装饰器

顾名思义，即作用于具体的类成员函数上的装饰器。

Methods装饰器有着广泛的用途。

### Debounce
- **调用方式**
    - `@Debounce( wait, [options={}] )`
    - `@Debounce`
- **参数**
    - **wait**: `Number` 延时多少毫秒之后执行函数 **Default**: 300 
    - **options**: `Object` 参数对象 
        - **leading**: `Boolean` 指定是否在超时之前触发函数。 **Default**: `true`
        - **maxWait**: `Number` 在函数触发前最大延时时间。
        - **trailing**: `Boolean` 指定是否在超时之后触发函数。 **Default**: `false`
- **用例**: 

```js
import { Page, Debounce } from '@wxa/core';

@Page
export default class Index {
    // 默认立刻执行函数，并且在一定延迟之内不会重复执行。
    @Debounce
    tap() {
        this.$router.push('pages/index');
    }

    // 指定延迟时间
    @Debounce(1000)
    longTap({detail: value}) {
        this.setData({
            phone: value
        })
    }
}
```

debounce，又称反抖动函数。大量应用于控制用户交互事件行为（点击，滑动等），由于用户可能误触引发事件回调，如果不加以控制，可能引起重复的后台请求。

故而，几乎所有用户交互事件都需要开发者做对应控制，这个时间一个Debounce装饰器可以帮助你优雅的开发业务代码:heart_eyes:

::: tip 提示
debounce函数，详见[`lodash debounce`](https://lodash.com/docs/4.17.10#debounce);
:::

### Delay
- **调用方式**
    - `@Delay( wait )`
- **参数**
    - **wait**: `Number` 延时多少毫秒之后执行函数
- **用例**: 
```js
import { Page, Delay } from '@wxa/core';

@Page
export default class Index {
    // 延迟1000ms之后执行函数
    @Delay(1000)
    sleepAndTravel() {
        this.$router.push('pages/index');
    }
}
```

延迟一段时间后执行函数。

::: tip 提示
delay函数，详见[`lodash delay`](https://lodash.com/docs/4.17.10#delay);
:::

### Deprecate
- **调用方式**
    - `@Deprecate`
- **用例**: 
```js
import { App, Deprecate } from '@wxa/core';

@App
export default class Index {
    // 延迟1000ms之后执行函数
    @Deprecate
    foo() {}
}
```

开发第三方的组件或者多人合作情况下，标识某些方法即将遗弃。继续调用该方法会有一个warning。

### Loading
- **调用方式**
    - `@Loading( tips, type )`
- **参数**
    - **tips**: `String` loading的文案提示 **Default** `Loading`
    - **type**: `String` 类型，可以指定使用导航栏loading动画或者界面loading动画 **Default** `loading`
- **用例**: 

自动显示loading动画。有两种类型`loading`或`bar`，分别是界面的loading动画及导航栏的动画。

### Lock
- **调用方式**
    - `@Lock`
- **用例**: 

Lock装饰器，与后台的事务锁不同，wxa的锁主要用于防止函数重复执行。在日常开发中，前端防重一直是个很重要的问题。在不用`Lock`的情况下，我们需要对每个函数都增加一个变量控制：

```js
import {Page} from '@wxa/core';

@Page
export default class Index {
    async login() {
        // 是否在做登录中，防止重复登录
        if(this.isLoging) return;
        this.isLoging = true;

        try {
            // 获取微信的code，用于从微信后台换取sessionKey
            let {code} = await this.$wxapi.login();
            // 后台提供的登录接口
            await this.$fetch('/remote/login', {code}, {}, 'POST');
            // 登录完成，记录状态
            this.setData({
                isLogged: true
            });
        } catch(e) {
            console.error(e);
        }

        // 重置标志位
        this.isLoging = false;
    }
}
```

而使用`Lock`之后，我们无需关心太多控制逻辑，代码更加清晰了然。

```js
import {Lock, Page, toast} from '@wxa/core';

@Page 
export default class Index {
    @Lock
    async login() {
        try {
            // 获取微信的code，用于从微信后台换取sessionKey
            let {code} = await this.$wxapi.login();
            // 后台提供的登录接口
            await this.$fetch('/remote/login', {code}, {}, 'POST');
            // 登录完成，记录状态
            this.setData({
                isLogged: true
            });
        } catch(e) {
            toast('登录失败~');
        }
    }
}
```

### Once
- **调用方式**
    - `@Once`
- **用例**: 

指定函数仅会执行一次，重复的调用只会返回第一次调用的结果。详见[`lodash Once`](https://lodash.com/docs/4.17.10#once);

### Throttle
- **调用方式**
    - `@Throttle( wait, [options={}] )`
    - `@Throttle`
- **参数**
    - **wait**: `Number` 每隔`wait`毫秒仅执行函数一次 **Default**: 1000 
    - **options**: `Object` 参数对象 
        - **leading**: `Boolean` 指定是否在超时之前触发函数。 **Default**: `true`
        - **trailing**: `Boolean` 指定是否在超时之后触发函数。 **Default**: `true`
- **用例**: 

限流函数。一般适用于持续高频触发的交互，比如`input`，`scroll`等短时间内有可能多次触发回调函数，密集的计算可能导致界面卡顿问题，这个时候一个限流函数就大有用武之地了。


## 其他

### message( title, content, options )
- **参数**:
    - **title**: `String` 标题
    - **content**：`String` 内容
    - **options**：`Object` 参考[微信文档](https://developers.weixin.qq.com/miniprogram/dev/api/ui/interaction/wx.showModal.html)

显示模态对话框。

```js
import {message} from '@wxa/core';

// 简单的消息提示
message('', '网络错误');
// 处理回调
message('', '是否选择放弃', {showCancel: false, confirmText: 'No'})
.then(({confirm})=>{
    console.log('Never Give Up~')
});
```

### toast( title, options )
- **参数**:
    - **title**: `String` 标题
    - **options**：`Object` 参考[微信文档](https://developers.weixin.qq.com/miniprogram/dev/api/ui/interaction/wx.showToast.html)

显示消息提示框

```js
import {toast} from '@wxa/core';

// 简单的消息
toast('输入有误');
// 处理回调
toast('输入有误')
.then(()=>{
    console.log('callback here');
});
```

::: tip 提示
toast 会默认帮你打开mask，防止用户误触其他回调。
:::

### eventbus
api 同 [Eventbus](#eventbus) 直接引入后使用，示例如下：

```js
import {eventbus} from '@wxa/core';

evenbuts.emit('LOGIN');
```
### fetch

api 同 [Fetch](#fetch) 直接引入后使用

```js
import {fetch} from '@wxa/core';

fetch('/api/get/xxx').then(()=>{});

```


### router
api 同 [Router](#router) 直接引入后使用，示例如下：

```js
import {router} from '@wxa/core';

router.push('/pages/index/landing');
```

### storage

api 同 [Storage](#storage) 直接引入后使用，示例如下：

```js
import {storage} from '@wxa/core';

storage.set('key', 'abc');
```

### sessionStorage

api 同 [SessionStorage](#sessionStorage) 直接引入后使用，示例如下：

```js
import {sessionStorage} from '@wxa/core';

sessionStorage.set('key', 'abc');
```


### utils
api 同 [Utils](#utils) 直接引入后使用，示例如下：

```js
import {utils} from '@wxa/core';

let defer = utils.getPromise();

setTimeout(defer.resolve, 1000);
```

### wxapi
api 同 [Wxapi](#wxapi) 直接引入后使用，示例如下：

```js
import {wxapi} from '@wxa/core';

wxapi.getSystemInfo('/pages/index/landing').then(()=>{});
```

