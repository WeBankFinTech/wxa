---
sidebar: auto
---
# wxa-core

![](https://img.shields.io/badge/wxa-core-brightgreen.svg)

[![Build Status](https://travis-ci.org/Genuifx/wxa.svg?branch=master)](https://travis-ci.org/Genuifx/wxa)
[![NPM version](https://img.shields.io/npm/v/@wxa/core.svg)](https://www.npmjs.com/package/@wxa/core)
[![codecov](https://codecov.io/gh/Genuifx/wxa/branch/master/graph/badge.svg)](https://codecov.io/gh/Genuifx/wxa)


`@wxa/core`是一个非常小巧的包，用于增强小程序原生的能力。可以单独使用，但是一般推荐配合[`@wxa/cli`](https://github.com/Genuifx/wxa-cli)一起使用，体验更佳：）

`@wxa/core`提供了下面几个Decorator，开发者可以选择性的引入，或者直接使用预定好的两个Decorator`@App`和`@Page`

## 全局
### setMaxRequest
- **Type**: `Function`
- **Default**: `maxRequest = 5`
- **Usage**:
```javascript
// app.js
import {wxa} from '@wxa/core'

wxa.setMaxRequest(4);

// ...other logic
```

设置最多同时并发的网络请求。

微信`wx.request`接口最多同时并发10个请求，超过10个请求将会被抛弃。wxa提供了一层request包装，引入队列控制并发请求。小程序业务层可以不关心并发多少个请求的问题，wxa将会保证每个请求都发出去。

::: warning 注意
最大并发请求不应该设置超过10    
超过最大并发的请求都会在队列等待其他请求完成后按顺序发出
:::

### setRequestExpiredTime
- **Type**: `Function`
- **Default**: `expiredTime=500ms`
- **Usage**:
```javascript
// app.js
import {wxa} from '@wxa/core'

wxa.setRequestExpiredTime(1000);

// ...other logic
```

设置post请求失效缓存失效时间。

使用wxa的`fetch`方法发送网络请求，wxa会缓存每个post请求，当客户端在一定时间内连续发送同一个请求的时候，wxa会主动reject并返回`{code: -101}`。相当于做一层前端post请求防重复。

::: warning 注意
wxa的前端防重机制大部分时间下可以很好的处理绝大多数请求重复的case。但是如果业务比较复杂，例如遇到多异步请求的事务性业务的时候，http层的请求防重并不能解决问题，wxa另外提供了一个`Lock`装饰器来处理这种情况。
:::


### addNoPromiseApi
- **Type**: `Function`
- **Usage**:
```javascript
import {wxa} from '@wxa/core'

wxa.addNoPromiseApi('getRecorderManager')

// ...other logic
```

wxa尝试为所有`wx.**`的方法做一次promise化，但是有一些同步的api却不应该这么做，因为他们会直接返回某个句柄或者结果值，如果为他们做了promise化，这些返回将会被损失。

## Storage API
storage方法包装了同步的wx.storage方法，提供简单，容易记得api

::: tip 提示
wxa提供了装饰器`Storage`和单独的`storage`

Decorators: 
```javascript
import {Storage} from '@wxa/core'

@Storage
class Idx {
    methods = {
        foo() {
            let abc = this.storage.get('abc')
        }
    }
}
```

直接使用: 
```javascript
import {storage} from '@wxa/core'

export default function foo() {
    let abc = this.storage.get('abc')
}
```

:::

### set
- **Pattern**: 
    - `set( key, value )`
- **Arguments** :
    - `{String} key`
    - `{Any} value`
- **Usage**: 
```javascript
this.storage.set(key, data)
```

同步保存数据到storage

::: warning 注意
storage并不能存`Function`类型的数据
:::

### get
- **Pattern**: 
    - `get( key )`
- **Arguments** :
    - `{String} key`
- **Usage**:
```javascript
let data = this.storage.get(key)
```

同步的获取数据

### remove
- **Pattern**: 
    - `remove( key )`
- **Arguments** :
    - `{String} key`
- **Usage**:
```javascript
this.storage.remove(key)
```

清除指定key的数据

### clear
- **Pattern**: 
    - `clear( )`
- **Usage**:
```javascript
this.storage.clear()
```

清除所有的storage数据


## Wxapi
包装了一层小程序的异步方法，使得开发者可以直接使用promise处理异步问题。
对于同步的方法，不做任何包装直接返回，示例如下：
1. navigateToMiniProgram
```javascript
this.wxapi.navigateToMiniProgram({params}).then(succ=>{}).catch(fail=>{})
```
2. getSystemInfoSync
```javascript
let value = this.wxapi.getSystemInfoSync();
```

::: warning 注意
wxapi对所有微信api一次promise化。其中不会做promisify的方法有：`create*`方法，`*Sync`方法和`getUpdateManager`方法。

使用`wxa.addNoPromiseApi`可以手动添加方法，避免被方法被错误的promise化
:::

## Router
同`vue-router`的api风格，包装了一层小程序的跳转方法。

### get
- **Pattern**: 
    - `get( )`
- **Usage**: 
```js
// {_webviewid: 1, route: 'pages/index/index', ...}
let currentPage = this.router.get(); 
```

获取当前路由页面信息

### getAll
- **Pattern**: 
    - `getAll( )`
- **Usage**: 
```js
// [{...}, {...}, {...}]
let stack = this.router.getAll();
```

获取当前路由栈，相当于调用了小程序的`getCurrentPages()`

### push
- **Pattern**: 
    - `push( url )`
- **Arguments**
    - `{String} url`
- **Usage**: 
```js
let url = '/pages/index';
this.router.push(url);

// 跳转完成后做一些特殊处理
this.router.push(url)
.then((succ)=>{
    this.storage.set('isCutomer', true);
})
.catch((fail)=>{
    toast('跳转失败');
})
```

跳转到新路由页面,压栈路由

### replace
- **Pattern**: 
    - `replace( url )`
- **Arguments**
    - `{String} url`
- **Usage**: 
```js
let url = '/pages/index';
this.router.replace(url);
```

关闭当前页面，打开新的指定页面

### reLaunch
- **Pattern**: 
    - `reLaunch( url )`
- **Arguments**
    - `{String} url`
- **Usage**: 
```js
this.router.reLaunch(url)
```

关闭所有调用栈，重新打开指定页面

### switch
- **Pattern**: 
    - `switch( url )`
- **Arguments**
    - `{String} url`
- **Usage**: 
```js
this.router.switch(url);
```

切换tabar页面

### go
- **Pattern**: 
    - `go( delta )`
- **Arguments**
    - `{Number} delta` 回退的页面数
- **Usage**: 
```js
this.router.go(-1);
```

回退页面, key为欲回退页面数

### goBack
- **Pattern**: 
    - `goBack( )`
- **Usage**: 
```js
this.router.goBack();
```

回退上一个页面，相当于调用`go(-1)`。

### close
- **Pattern**: 
    - `close( )`
- **Usage**: 
```js
this.router.close();
```

关闭小程序。:warning:谨慎调用，将会直接关闭小程序。

::: tip 提示
`router`提供的函数除了`get`, `getAll`之外都有返回一个promise的回调。 
:::

## Eventbus
wxa提供了一个简易的自定义事件管理，允许用户跨页面，跨组件的共享信息。

### on( name, handler )
- **arguments**
    - `{String} name`
    - `{Function} handler`
- **Usage**: 
```js
@Eventbus
class Foo {
    boo() {
        this.eventbus.on('event', this.handler);
    }
    handler(e) {
        console.log('event, handle here');
    }
}
```

监听一个自定义事件，当事件触发的时候执行回调队列。

### off( name, handler )
- **arguments**
    - `{String} name`
    - `{Function} handler`
- **Usage**: 
```js
@Eventbus
class Foo {
    boo() {
        this.eventbus.on('event', this.handler);
    }
    handler(e) {
        console.log('event, handle here');
        this.eventbus.off('event', this.handler);
    }
}
```

取消监听一个自定义事件

### emit( name )
- **arguments**
    - `{String} name`
- **Usage**: 
```js
this.eventbus.emit('my-event')
```

触发一个自定义事件

### clear( name )
- **arguments**
    - `{String} name`
- **Usage**: 
```js
this.eventbus.clear(); // 注意这么写会清空所有事件
this.eventbus.clear('event'); // 清楚所有event事件监听
```

清空指定事件回调，或者清空所有事件回调

## Fetch
`wxa`为网络请求提供了一个好用的`Fetch`装饰器，通过`fetch`，开发者可以快速的发起请求，而不需要担心`wx.request`引发的其他问题。

`fetch`api具有promise化，队列化请求的能力，同时具备对`post`请求的短时间防重。

### fetch
- **pattern**
    - `fetch( url, data, configs, methods )`
- **arguments**
    - `{String} url`
    - `{Object} data` 请求携带的数据
    - `{Object} configs` 请求的配置
        - `{Boolean} $top` 高优先级请求，直接压入等待队列的列首
        - `{Boolean} $noCache` 指定该请求不做防重处理
        - `other` 其他小程序默认的配置都放在这里，例如header，dataType
    - `{String} methods` 请求方式, get, post
- **Usage**: 
```js
@Fetch
class UserInfo {
    get(){
        this.fetch('/remote/user/get', {}, {}, 'get')
        .then((succ)=>{
            // handle response here
        })
    }
}

```

## Utils
常用的工具函数

### formatDate
- **pattern**
    - `fetch( timestap, format )`
- **arguments**
    - `{Number or String} timestap`
    - `{String} format` 格式化后的时间格式，默认`'yyyy-MM-dd hh:mm:ss'`
- **Usage**: 
```js
@Utils
class T {
    foo() {
        let dateStr = this.utils.formatDate(Date.now());
        
        // .... other control
    }
}
```

格式化时间戳为指定格式的字符串

### trim
- **pattern**
    - `trim( str )`
- **arguments**
    - `{String} str`
- **Usage**: 
```js
@Utils
class T {
    foo(str) {
        str = this.utils.trim(str);
        
        // .... other control
    }
}
```

由于小程序部分终端不支持`.trim`方法，所以wxa提供了一个补丁方法。

### compareVersion
- **pattern**
    - `compareVersion( v1, v2 )`
- **arguments**
    - `{String} v1`
    - `{String} v2`
- **Usage**: 
```js
@Utils
class T {
    foo(str) {
        let ret = this.utils.compareVersion('1.2.1', '1.1.0'); // 1
        
        // .... other control
    }
}
```

小程序官方提供的基础库比较函数。

### debounce
- **pattern**
    - `debounce( fn, [wait=0], [options={}] )`
- **arguments**
    - `{Function} fn`  The function to debounce.
    - `{Number} wait`  The number of milliseconds to delay.
    - `{Object} options` The options object.
        - `{Boolean} leading` Specify invoking on the leading edge of the timeout.
        - `{Number} maxWait` The maximum time func is allowed to be delayed before it's invoked
        - `{Boolean} trailing` Specify invoking on the trailing edge of the timeout.
- **Usage**: 
```js
@Utils
class T {
    foo(str) {
        let release = ()=>this.isDone=true;
        let ret = this.utils.debounce(release, 300); // 1
        
        // .... other control
    }
}
```

debounce函数，详见[`lodash debounce`](https://lodash.com/docs/4.17.10#debounce);

### throttle
- **pattern**
    - `throttle( fn, [wait=0], [options={}] )`
- **arguments**
    - `{Function} fn`  The function to throttle.
    - `{Number} wait`  The number of milliseconds to delay.
    - `{Object} options` The options object.
        - `{Boolean} leading` Specify invoking on the leading edge of the timeout.
        - `{Boolean} trailing` Specify invoking on the trailing edge of the timeout.
- **Usage**: 
```js
@Utils
class T {
    foo(str) {
        let release = ()=>this.isDone=true;
        let ret = this.utils.throttle(release, 300); // 1
        
        // .... other control
    }
}
```

throttle节流函数，详见[`lodash throttle`](https://lodash.com/docs/4.17.10#throttle);

## Redux全局状态管理
`@wxa`提供了一个[redux](https://github.com/Genuifx/wxa-redux.git)集成小程序方案，方便开发者管理全局应用状态

### 挂载
要使用`@wxa/redux`首先需要挂载插件到wxa。
```javascript
// app.wxa or app.js
import {wxa} from '@wxa/core'
import {wxaRedux, combineReducers} from '@wxa/redux'
import promiseMiddleware from 'redux-promise';

wxa.use(wxaRedux, {
    reducers: combineReducers(...your reducer),
    middlewares: [promiseMiddleware]
})
```
挂载完毕后，wxa会在所有调用`launchApp`,`launchPage`和`launchComponent`的地方自动connect store到相应示例。

### 映射
`@wxa/redux`并不会把所有reducer都映射到实例，只有在实例中指定了的reducer才能自动从store同步。

#### 映射到Page
```javascript
// page.js
import {Page, wxa} from '@wxa/core'

@Page
class Index {
    mapState = {
        todolist : (state)=>state.todo
    }
    methods = {
        bindtap() {
            // dispatch your commit here
            this.store.dispatch({type: 'Add_todo_list', payload: 'coding today'});
            // and your page data will auto update.
        }
    }
} 

wxa.launchPage(Index)

```

#### 映射到Component
```javascript
// component.js
import {GetApp} from '@wxa/core'

// redux need mount app to com.
@GetApp
class Com {
    mapState = {
        todolist : (state)=>state.todo
    }
    methods = {
        bindtap() {
            // dispatch your commit here
            this.store.dispatch({type: 'Add_todo_list', payload: 'coding today'});
            // and your page data will auto update.
        }
    }
} 

wxa.launchComponent(Com);
```

具体的实现细节可以参考[@wxa/redux](https://github.com/Genuifx/wxa-redux.git)

## 插件
wxa在调用`launchApp`,`launchPage`和`launchComponent`生成实例的时候会自动应用每个注册的插件，插件机制允许开发者为wxa开发新的功能。

### 插件示例
```javascript
// somthing report error message to remote server
import wa from 'wa'

export default (options)=>{
    return (vm, type)=>{
        if(['App', 'Page'].indexOf(type) > -1){
            vm.logger = wa;
        }
    }
}
```
插件将拿到当前实例`vm`, 以及实例的类型`App`，`Page`，`Component`。

