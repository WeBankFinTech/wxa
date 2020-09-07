---
title: '小程序状态管理方案'
type: 'api'
sidebar: auto
---

[![NPM version](https://img.shields.io/npm/v/@wxa/redux/latest.svg)](https://www.npmjs.com/package/@wxa/redux)
![npm bundle size (minified + gzip)](https://img.shields.io/bundlephobia/minzip/@wxa/redux/latest.svg)

redux 小程序适配方案。在小程序开发中使用 `redux` 管理全局状态。

尽管小程序入门门槛非常之低，但是在项目不停的迭代过程中，不可避免的项目代码复杂度也会越来越高，从前我们可以将跨页面数据管理在[Storage](/core/API.html#storage)或者[SessionStorage](/core/API.html#sessionstorage)中，利用一定的代码规范来管理不同页面不同开发者的数据，但随着时间的推移这种方式会造成代码、数据过于分散，且容易出错覆盖。再者每个页面间都需要手动的去 `storage` 读取数据，略显繁琐。

当项目开始变得复杂，我们想要统一的管理起状态数据，自动的同步、分发数据到需要的页面、组件（`Reactive`）。


## 安装

``` bash
# 使用npm安装
npm i -S @wxa/redux
# 使用yarn安装
yarn add @wxa/redux
```

## 基本用法
### 挂载插件
在`app.js`/`app.wxa`中挂载插件

``` js
// app.js or app.wxa
import {App, wxa} from '@wxa/core';
// 引入插件方法
import {wxaRedux, combineReducers} from '@wxa/redux'
import promiseMiddleware from 'redux-promise';

// 注册插件
wxa.use(wxaRedux, {
    reducers: combineReducers(...your reducer),
    middlewares: [promiseMiddleware]
})

@App
export default class Main {};
```

注册完 redux 插件之后，将会自动的调用 `redux.createStore` 创建一个用于存储全局状态数据 `store`，并且插件会在自动的挂载 `store` 到 App、Component、Page 实例中 `$store` 。

通过 `this.$store.getState()`可以获得所有全局状态。

通过 `this.$store.dispatch()`可以提交一个状态修改的 action。

更详细的 [store api](https://redux.js.org/api/store)

### 获取全局状态
在页面/组件类中定义 `mapState` 对象，指定关联的全局状态（在`react`中叫`connect`）。

``` js
import {Page} from '@wxa/core';

@Page
export default class Index {
    mapState = {
        todolist$ : (state)=>state.todo,
        userInfo$ : (state)=>state.userInfo
    }

    add() {
        // dispatch change state.
        // todo list will auto add one.
        this.$store.dispatch({type: 'Add_todo_list', payload: 'coding today'});
    }
}
```

然后再`template`中就可以直接使用映射的数据了。

``` xml
<view>{{userInfo$.name}}</view>
<view wx:for="{{todolist$}}">{{key+1}}{{item}}</view>
```

得益于 `@wxa/core` 的 [diff方法](/core/API.html#vm-diff)，redux在同步数据的时候只会增量的修改数据，而不是全量覆盖 :grin:

#### 在任意位置获取全局状态数据

编写一些通用的基础函数提供给页面调用的时候，可能会需要从 `store` 中读取相应数据做处理。 例如在我们需要在所有请求的 postdata 中统一的加上用户的基本信息，可以这么实现：

```js
// 任意 api.js
import {fetch} from '@wxa/core`;
import {getStore} from '@wxa/redux';

export default const customFetch = (...args) => {
    let {idNo, name} = getStore().getState().UserModel;

    // 每个请求自动添加用户
    args[1] = {
        idNo, name
        ...args[1],
    };

    return fetch(...args);
}
```

### 个性化页面数据

有时我们可能需要临时改写一下数据用于展示，实现类似 `vue` `computed` 的效果，此时我们可以相应的改造 mapState。

```js
export default class A {
    mapState = {
        userInfo$(state){
            let model = state.UserModel;

            // 自动掩码用户的身份证、姓名
            // diff 数据并自动调用 setData
            this.$diff({
                idNoCover: model.idNo.replace(/([\d]{4})(\d{10})([\dxX]{4})/, '$1***$3')
            })

            return model
        }
    }
}
```


## 分包用法

当小程序应用开始使用[分包技术](https://developers.weixin.qq.com/miniprogram/dev/framework/subpackages.html)的时候，redux 方案也需要相应的做出优化，分包有以下特点：

> 引用原则 
> - packageA 无法 require packageB JS 文件，但可以 require app、自己 package 内的 JS 文件
> - packageA 无法 import packageB 的 template，但可以 require app、自己 package 内的 template
> - packageA 无法使用 packageB 的资源，但可以使用 app、自己 package 内的资源

即当分包 A 定义了自己业务逻辑的数据 model 之后，且该 model 无法被其他分包复用，则我们完全可以把对应 model 放到分包的页面中，懒加载对应 `redux.reducer`，以此减少主包体积。

为了做到懒加载对应的 reducer，我们需要在改造一下我们的代码。

### 挂载插件

在`app.js`/`app.wxa`中，改造 `reducer` 的注册方式。

``` js {9-14}
// app.js or app.wxa
import {App, wxa} from '@wxa/core';
// 引入插件方法
import {wxaRedux, combineReducers} from '@wxa/redux'
import promiseMiddleware from 'redux-promise';

// 注册插件
wxa.use(wxaRedux, {
    // reducers: combineReducers(...your reducer),
    reducers: {
        UserModel: userReducer,
        AppModel: appReducer,
        ...your reducer
    },
    middlewares: [promiseMiddleware]
})

@App
export default class Main {};
```

### 动态添加分包 Reducer

假设我们在分包 A 中定义了专门用于订单处理的 `reducer`，分包入口页面为 `subpages/A/pages/board`。

在分包页面被使用之前我们需要动态的注册一个新的 `reducer`。

```js {2,6}
// subpages/A/pages/board
import {reducerRegistry} from '@wxa/redux';
import AOrderModel from '/subpages/A/models/order.model.js';

// 注册对应的数据 model
reducerRegistry.register('AOrderModel', AOrderModel);
```

注册完毕之后，后续所有分包 A 的页面都可以正常的使用 `mapState` 中映射页面需要使用的状态数据。


## 调试 Redux

`@wxa/redux` 提供了小程序 `redux-remote-devtools` 的适配代码。稍微改造一下我们的挂载插件部分的代码即可使用：

```js
import {App, wxa} from '@wxa/core';
// 引入插件方法
import {wxaRedux, combineReducers, applyMiddleware} from '@wxa/redux'
import { composeWithDevTools } from '@wxa/redux/libs/remote-redux-devtools.js';
import promiseMiddleware from 'redux-promise';

const composeEnhancers = composeWithDevTools({ realtime: true, port: 8000 });

// 注册插件
wxa.use(wxaRedux, {
    // reducers: combineReducers(...your reducer),
    reducers: {
        UserModel: userReducer,
        AppModel: appReducer,
        ...your reducer
    },
    middlewares: composeEnhancers(applyMiddleware(promiseMiddleware))
})

```

打开开发者工具不校验合法域名开关，就可以正常使用 `redux-devtools` 了。

由于 `devtools` 仅用于开发阶段，我们可以利用 `wxa` 提供的依赖分析能力，按需引入。

改写上续配置如下：

```js
import {App, wxa} from '@wxa/core';
// 引入插件方法
import {wxaRedux, combineReducers, applyMiddleware} from '@wxa/redux'
import promiseMiddleware from 'redux-promise';

let composeEnhancers = (m) => m;

if (process.env.NODE_ENV === 'production') {
    let composeWithDevTools = require('@wxa/redux/libs/remote-redux-devtools.js').composeWithDevTools;
    composeEnhancers = composeWithDevTools({ realtime: true, port: 8000 });
}

// 注册插件
wxa.use(wxaRedux, {
    // reducers: combineReducers(...your reducer),
    reducers: {
        UserModel: userReducer,
        AppModel: appReducer,
        ...your reducer
    },
    middlewares: composeEnhancers(applyMiddleware(promiseMiddleware))
})

```

如上配置，当 `process.env.NODE_ENV` 设置为生产环境的时候，`@wxa/redux/libs/remote-redux-devtools.js` 将不会被打包进 `dist`

## 持久化数据

某些场景，为了用户体验，我们需要将对应数据缓存下来，方便下次用户可以直接看到对应页面，此时我们需要将 `store` 的数据缓存下来，这里我们使用 [`redux-persist`](https://github.com/rt2zz/redux-persist) 用于持久化数据。

示例如下：
```js
import {wxa, App} from '@wxa/core';
import wxaRedux from '@wxa/redux';
import wxPersistStorage from '@wxa/redux/libs/wx.storage.min.js';
import {persistStore, persistReducer} from 'redux-persist';

import orderModel from './order.model.js';

let persistOrderModel = persistReducer({
    key: 'orderModel',
    storage: wxPersistStorage,
    timeout: null, // 超时时间，设置为 null
}, orderModel);

wxa.use(wxaRedux, {
    reducers: {
        orderModel: persistOrderModel
    }
})

@App
export default class {
    onLaunch() {
        // 冷启动开始就加载缓存数据
        persistStore(this.$store, {}, ()=>this.$storeReady=true);
    }
}
```

## 实时日志

我们可以结合小程序[实时日志](https://developers.weixin.qq.com/miniprogram/dev/framework/realtimelog/)和 `redux-logger` 一起使用。

```js
import {wxa, App} from '@wxa/core';
import {createLogger} from 'redux-logger';
import wxaRedux from '@wxa/redux';

let log = wx.getRealtimeLogManager ? wx.getRealtimeLogManager() : console;

let logger = createLogger({
    logger: log
});

wxa.use(wxaRedux, {
    reducers: {...your reducers},
    middlewares: [logger]
});
```

配置完毕之后，项目中所有的 `Action` 日志都将上报到微信的实时日志后台，开发者可以登录 mp.weixin.qq.com 查看用户所有操作记录。

## 配置

### reducers

- **类型**: 
    - **Function** `combineReducers(...reducer)`的返回
    - **Object** `reducer` 列表，用于动态注册场景

### middlewares

- **类型**: 
    - **Array** redux 中间件列表
    - **Function** `applyMiddleware(...middlewares)`的返回

### initialState

- **类型**: 
    - **any** reducer 初始状态，参考 [`redux 文档`](https://redux.js.org/api/createstore)

### debug

- **类型**: 
    - **Boolean** `false`

是否打印插件日志

## 技术细节
`wxa/redux`根据不同的实例类型有不同的任务，在App层，我们需要创建一个`store`并挂载到app中，在`Page`和`Component`层，我们做了更多细节处理。

- **App Level**    
创建`store`，应用redux的中间件，挂载`store`到App实例。

- **Page Level**    
在不同的生命周期函数，有不同的处理。
    - `onLoad` 根据`mapState`订阅`store`的数据，同时挂载一个`unsubscribe`方法到实例。
    - `onShow` 标记页面实例`$$isCurrentPage`为`true`, 同时做一次状态同步。因为有可能状态在其他页面做了改变。
    - `onHide` 重置`$$isCurrentPage`，这样子页面数据就不会自动刷新了。
    - `onUnload` 调用`$unsubscribe`取消订阅状态

3. **Component Level**    
针对组件生命周期做一些单独处理
    - `created` 挂载`store`
    - `attached` 订阅状态，并同步状态到组件。
    - `detached` 取消订阅