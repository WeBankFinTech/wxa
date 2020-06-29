# @wxa/redux
[![NPM version](https://img.shields.io/npm/v/@wxa/redux/latest.svg)](https://www.npmjs.com/package/@wxa/redux)
![npm bundle size (minified + gzip)](https://img.shields.io/bundlephobia/minzip/@wxa/redux/latest.svg)

redux小程序适配方案，在小程序开发中使用redux管理全局状态。

## 安装
``` bash
# 使用npm安装
npm i -S @wxa/redux
```

## 用例
1. 在`app.js`/`app.wxa`中挂载插件。
``` js
// app.js or app.wxa
import {App, wxa} from '@wxa/core';
import {wxaRedux, combineReducers} from '@wxa/redux'
import promiseMiddleware from 'redux-promise';

wxa.use(wxaRedux, {
    reducers: combineReducers(...your reducer),
    middlewares: [promiseMiddleware]
})

@App
export default class Main {};
```

挂载成功后，插件会在App、Component、Page实例中挂载store到`$store`。通过`$store.getState()`可以获得所有全局状态。

2. 在页面/组件类中定义`mapState`对象，指定关联的全局状态（在`react`中叫`connect`）。
``` js
import {Page} from '@wxa/core';

@Page
export default class Index {
    mapState = {
        todolist : (state)=>state.todo,
        userInfo : (state)=>state.userInfo
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
<view>{{userInfo.name}}</view>
<view wx:for="{{todolist}}">{{key+1}}{{item}}</view>
```

得益于`@wxa/core`的diff方法，redux在同步数据的时候只会增量的修改数据，而不是全量覆盖。:grin:

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