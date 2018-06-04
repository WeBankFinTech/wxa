# Mixin
`wxa`支持混合，合并规则为：方法`methods`和数据`data`按引入顺序依次覆盖，生命周期函数按引入顺序依次执行。

```javascript
// common.js
export default {
    data: {
        email: 'genuifx@gmail.com',
    },
    onLoad(q) {
        console.log('common mixin onLoad');
        console.log(q);
        console.log(this.data);
    },
    methods: {
        bindViewTap() {
            this.router.push('../logs/logs');
        },
    },
};
```

在页面类指定mixins属性，`wxa`将在实例化Page之前把mixins的内容混合到实例。

```javascript
// page instance
@Page
class Index{
    mixins = [common]
    //your logic here
}
wxa.launch.page(Index);
```

或者使用`Mixins`装饰器实现混合。

```javascript
// page instance
@Page
@Mixins(common)
class Index{
    //your logic here
}
wxa.launch.page(Index);
```

::: tip 提示
1. wxa并不支持全局Mixin，即在App层使用mixin和Page层的效果是一样的，如果想要全局mixin，可以考虑使用plugin插件机制实现。
2. 待混合的方法必须要放在`methods`中，而生命周期函数则挂载object的最外层。
:::

::: warning 注意
`onShareAppMessage`由于该回调的局限性，mixin并不会对它做任何处理，所以请在页面层做好分享设置。
:::