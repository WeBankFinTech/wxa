# wxa-plugin-bind-hijack

[![NPM version](https://img.shields.io/npm/v/@wxa/lugin-bind-hijack.svg)](https://www.npmjs.com/package/@wxa/lugin-bind-hijack)

劫持小程序bind事件

## install
```
npm install -S @wxa/plugin-bind-hijack
```


## Usage
### 在wxa打包配置中使用
使用插件时，需要实例化插件并传入参数，支持拦截所有事件和指定拦截事件
```javascript
// wxa.config.js
const BindHijackPlugin = require('@wxa/plugin-bind-hijack');

module.exports = {
    resolve: {
        alias: {
            '@': path.join(__dirname, 'src'),
        },
    },
    use: ['babel', 'sass'],
    plugins: [
        // 指定拦截事件
        new BindHijackPlugin([
            'tap',
            'getuserinfo',
        ]);

        // 拦截所有事件
        new BindHijackPlugin();
    ]
}
```

### 实现拦截函数
在app.js中引入运行时组件，并实现钩子函数
```javascript
/**
 * wxa plugin
 */
import BindHijackPlugin from "@wxa/plugin-bind-hijack/runtime";

/**
 * 钩子函数名字为 before${event}或 after${event}
 * 事件首字母大写
 * 如： beforeTap、afterGetuserinfo
 */
wxa.use(BindHijackPlugin, {
    // tap事件之前调用
    beforeTap: function(e){
        console.log('beforeTap', e);
    },
    // getuserinfo事件之后调用
    afterGetuserinfo: function(e){
        console.log('afterGetuserinfo', e);
    },
    // 所有事件之前调用
    before: function(e){
        console.log('before', e);
    },
    // 所有事件之后调用
    after: function(e){
        console.log('after', e);
    },
});

```

### 其他说明
1. 拦截事件支持bind和catch（阻止冒泡），支持冒号写法（bind:tap）
2. 自动执行执行的事件也会触发拦截，如：swiper设置了autoplay时，bindchange事件会自动执行
3. 事件对象的dataset中注入节点相关信息，包括：data、type、class、id，通过e.mark.id获取
