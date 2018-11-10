# 生命周期

## beforeRouteEnter
- **类型**: `Function`
- **用法**：

在路由开始跳转，页面实例化之前被执行。即拿不到页面实例，也访问不到任何页面实例数据。

::: tip 提示
`beforeRouteEnter`是wxa框架特有的生命周期，必须使用`router.*`方法压栈的方法才会触发。

利用`beforeRouteEnter`, 可以实现小程序页面数据的预加载。
:::

## 原生
原生小程序所有生命周期回调函数都不变，具体请查看
- [App生命周期](https://developers.weixin.qq.com/miniprogram/dev/framework/app-service/app.html)
- [页面生命周期](https://developers.weixin.qq.com/miniprogram/dev/framework/app-service/page.html#%E7%94%9F%E5%91%BD%E5%91%A8%E6%9C%9F%E5%9B%9E%E8%B0%83%E5%87%BD%E6%95%B0)
- [自定义组件生命周期](https://developers.weixin.qq.com/miniprogram/dev/framework/custom-component/component.html)
