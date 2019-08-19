# 基础开发

## 注册小程序

### 原生示例

原生的小程序开发使用App() 函数用来注册一个小程序。一个典型的`app.js`如下： 
```javascript
App({
    // 生命周期函数处理
    onLaunch(){},
    onShow() {},
    // 小程序出错处理
    onError(e) {
        errorHandler(e);
    },
    // 全局数据缓存
    globalData: {
        userInfo: null,
        isGuess: true,
        configs: {}
    },
});
```

详细的[官方链接](https://developers.weixin.qq.com/miniprogram/dev/framework/app-service/app.html)

### wxa示例

使用`wxa2`，开发者无需手动注册App，直接`export`一个默认实例即可：

``` js
import {App} from '@wxa/core';

// 使用App装饰器为Main类增加能力
@App
export default class Main {
    globalData = {
        userInfo: null,
        isGuess: true,
        configs: {}
    }
    // 生命周期函数
    onLaunch() {
        // 事件触发
        this.eventbus.emit('app-launch');
    }
    // 全局方法
    async login() {
        // 调用promisify后的wx.login接口
        let succ = await this.$wxapi.login();

        return succ;
    }
}
```

可以看到注册`wxa`小程序，我们做了2件事
1. 使用`@App`装饰器
2. 导出并声明一个`Main`主类

App装饰器并不是必须的，如果觉得项目中并不需要用到那么多功能，可以按需使用对应的[Decorators](/core/decorators/class.html)。

最后，wxa会自动将导出主类实例化后调用`App`注册小程序。

::: tip 提示
@App为Main类自动挂载了`Storage`，`Eventbus`, `Wxapi`, `Router`, `Fetch`以及`Utils`函数
:::

::: warning 注意
@App虽然挂载了`Router`方法，但是请勿在小程序`onLaunch`之前调用。
:::

## 注册页面

### 原生示例
原生的小程序开发使用`Page()`函数用来注册一个页面。一个典型的`index.js`如下： 

``` js
let instance = {
    data: {},
    // 生命周期函数
    onLoad() {},
    onShow(){},
    // 自定义事件处理函数
    tap(e) {}
    // 设置分享
    onShareAppMessage(){}
};

Page(instance);
```

详细的[官方链接](https://developers.weixin.qq.com/miniprogram/dev/framework/app-service/page.html)

### wxa示例
在`wxa2`开发者无需手动注册Page，直接`export`一个默认实例即可：

``` js
import {Page} from '@wxa/core';

// 使用Page装饰器自动挂载class装饰器。
@Page
export default class Index {
    // 页面数据
    data = {}
    // 生命周期函数
    onLoad() {}
    onShow() {}
    // 回调处理函数
    tap(e) {}
}
```

::: tip 提示
@App为Main类自动挂载了`Storage`，`Eventbus`, `Wxapi`, `Router`, `Fetch`以及`Utils`函数

`@wxa/core`为每个页面实例注入了[`$go`](/core/feature.html#go-event)方法，解决微信跳转延迟的引发的多次跳转问题，在重构阶段可以快速开发页面。
:::

可以看到注册`wxa`的小程序页面，我们做了2件事
1. 使用`@Page`装饰器
2. 声明并导出一个`Index`页面类

同样的这处的`Page`装饰器也不是必须的，开发者可以根据实际需要引入指定的装饰器即可。

wxa将会自动将导出的Index类实例化后调用`Page`注册页面。
