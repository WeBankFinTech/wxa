# Class装饰器
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

## App
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

## Page
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

## Eventbus
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

### on( name, handler )
- **参数**
    - **name**: `String` 监听的自定义事件名
    - **handler**: `Function` 回调函数
- **用例**: 


监听一个自定义事件，当事件触发的时候执行对应回调函数。

### off( name, handler )
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

### emit( name, payload )
- **参数**
    - **name**: `String` 监听的自定义事件名
    - **payload**: `[Object, String, Number]` 回调函数接受的参数
- **用例**: 

触发一个自定义事件

### clear( name )
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

## Fetch
`wxa`为网络请求提供了一个好用的`Fetch`装饰器，通过`fetch`，开发者可以快速的发起请求，而不需要担心`wx.request`引发的其他问题。

`fetch`api具有promise化，队列化请求的能力，同时具备对`post`请求的短时间防重。

### fetch( url, data, configs, method )
- **参数**
    - **url**: `String` 接口地址
    - **data**: `Object` 请求携带的数据
    - **configs**: `Object` 请求的配置
        - **$top**: `Boolean` 高优先级请求，直接压入等待队列的列首
        - **$noCache**: `Boolean` 指定该请求不做防重处理
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

## Router
简洁的路由API，用于跳转小程序路由页面。

::: tip 提示
使用`Router`提供的路由方法跳转，可以享受wxa提供的预加载特性，具体请查看生命周期`beforeRouteEnter`文档。
:::

### get( )
- **用例**: 
```js
// {_webviewid: 1, route: 'pages/index/index', ...}
let currentPage = this.$router.get(); 
```

获取当前路由页面信息

### getAll( )
- **用例**: 
```js
// 获取完整的页面栈
let stack = this.$router.getAll();
```

获取当前路由栈，相当于调用了小程序的`getCurrentPages()`。

### push( path )
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

### replace( path )
- **参数**
    - **path**: `String`
- **用例**: 

关闭当前页面，打开新的指定页面。

### reLaunch( path )
- **参数**
    - **path**: `String`
- **用例**: 

关闭所有页面栈中的页面，重新打开指定页面。

### switch( path )
- **参数**
    - **path**: `String`
- **用例**: 

切换tabar页面。

### go( delta )
- **参数**
    - **delta**: `Number` 回退的页面数
- **用例**: 

回退页面, delta为欲回退页面数。

### goBack( )
- **用例**: 

回退上一个页面，相当于调用`this.$router.go(-1)`。

### close( )
- **用例**: 

关闭小程序。

:warning:谨慎调用，将会直接关闭小程序。

::: warning 警告
`this.$router.close()`方法不保证未来小程序官方会不会封禁，建议减少使用。
:::

## Storage
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

### set( key, value )
- **参数**:
    - **key**: `String`
    - **value**: `Any`
- **用例**: 

同步的缓存数据到storage。

### get( key )
- **参数** :
    - **key**: `String`
- **用例**:

同步的获取缓存数据。

### remove( key )
- **参数** :
    - **key**: `String`
- **用例**:

清除指定key的缓存数据。

### clear( )
- **用例**:

⚠️清除所有的缓存数据。


## Utils
工具函数集

### formatDate( timestap, format )
- **参数**
    - **timestap**: `[Number, String]`
    - **format**: `String` 格式化后的时间格式，默认`'yyyy-MM-dd hh:mm:ss'`
- **用例**: 

```js
let dateStr = this.$utils.formatDate(Date.now());
```

格式化时间戳为指定格式的字符串

### trim( str )
- **参数**
    - **str**: `String`
- **用例**: 

```js
let trimStr = this.$utils.trim(str);
```

由于小程序部分终端不支持`.trim`方法，所以wxa提供了一个补丁方法。

### compareVersion( v1, v2 )
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

## Wxapi
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
