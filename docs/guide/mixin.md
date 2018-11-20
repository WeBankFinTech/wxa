# Mixin
`vue`开发者应该很熟悉的一个概念，通过抽离组件公共逻辑到单独一个js文件，再需要使用的时候只需做一次mixin操作即可。mixin提高了代码复用率，但是降低了代码的可读性，开发过程中还是需要谨慎使用。

**混合规则**为：组件（页面也算组件的一种）方法`methods`项和数据`data`项按引入顺序**依次覆盖**，生命周期函数按引入顺序**依次执行**。

定义一个页面的方法如下：

```javascript
// common.js
export default class Common {
    data = {
        email: 'genuifx@gmail.com',
    },
    onLoad(q) {
        console.log('common mixin onLoad');
        console.log(q);
        console.log(this.data);
    },
    bindViewTap() {
        this.router.push('../logs/logs');
    },
};
```

使用`Mixin`有两种方式：
- 在页面类指定mixins属性。
- 使用`Mixins`装饰器实现混合。

两种方式只是写法不同，最终`wxa`都会在实例化之前把mixins的内容做好合并。

```javascript
// 直接指定mixins项
@Page
export default class Index{
    mixins = [common]
}

// 使用Mixins装饰器
@Page
@Mixins(common)
export default class Index{}
```

需要注意的是，上述操作一样适用于App实例，也就是说`App level`的mixin只对App实例有效，需要使用全局mixin可以参考进阶教程。

::: warning 注意
`onShareAppMessage`由于该回调的特殊性，多个onShareAppMessage只会返回最后一个函数的返回。
:::