# 基础开发

## 注册小程序
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

> 详细的[官方链接](https://developers.weixin.qq.com/miniprogram/dev/framework/app-service/app.html)

如果想更加舒适的开发的话，可以引入`@wxa/core`来增强小程序，通过`wxa.launchApp`来注册小程序，你可以获得`mixins`，`plugin`等能力。一个典型的`app.wxa`如下：
```vue
<script>
import {App, wxa} from '@wxa/core'

// 使用App装饰器为Main类增加能力
@App
class Main {
    constructor() {
        // 全局数据
        this.globalData = {
            userInfo: null,
            isGuess: true,
            configs: {}
        }
    }
    // 生命周期函数
    onLaunch() {
        // 事件触发
        this.eventbus.emit('app-launch');
    }
    onShow() {}
    // 全局方法
    methods = {
        login() {
            // 调用promisify后的wx.login接口
            this.wxapi.login().then((succ)=>console{.log(succ.code)})
        }
    }
}

// 注册App
wxa.launchApp(Main);
</script>
```
::: tip 提示
@App为Main类自动挂载了`Storage`，`Eventbus`, `Wxapi`, `Fetch`以及`Utils`函数
:::

::: warning 注意
@App并没有挂载`Router`相关的方法
:::

可以看到注册`wxa`小程序，我们做了三件事
1. 使用`@App`装饰器
2. 声明一个`Main`主类
3. 使用`wxa.launchApp`注册主类

## 注册页面
原生的小程序开发使用Page() 函数用来注册一个小程序。一个典型的`index.js`如下： 
```javascript
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
> 详细的[官方链接](https://developers.weixin.qq.com/miniprogram/dev/framework/app-service/page.html)

同样的`wxa`为页面提供了常用的`Page`装饰器，用于给页面挂载上非常好用的api，如`storage`，`Router`等。

```vue
<script>
import {Page, wxa} from '@wxa/core'

// 使用Page装饰器增强页面能力
@Page
class Index {
    constructor() {
        // 初始化处理
        this.data = {

        }
    }
    // 生命周期函数
    onLoad() {}
    onShow() {}
    methods = {
        tap(e) {
            // 处理tap事件
        }
    }
}

// 使用wxa.lauchPage注册页面
wxa.launchPage(Index);
</script>
```
::: tip 提示
@App为Main类自动挂载了`Storage`，`Eventbus`, `Wxapi`, `Router`, `Fetch`以及`Utils`函数
:::

::: warning 注意
1. `@wxa/core`1.4版本开始不会将取消页面的自动分享。（之前的设计的确是很糟糕）
~~`wxa.launchPage`自动为页面打开了分享，如果需要关闭分享需要设置`onShareAppMessage=false`~~

2. `@wxa/core`为每个page提供了一个私有的`$go`方法，解决微信跳转延迟的引发的多次跳转问题。
示例：
```html
<view bindtap="$go" data-path="/pages/index">去首页</view>
<view bindtap="$go" data-path="/pages/activity" data-type="replace">跳转活动页</view>
```
:::

可以看到注册`wxa`的小程序页面，我们做了三件事
1. 使用`@Page`装饰器
2. 声明一个`Index`页面类
3. 使用`wxa.launchPage`注册页面类