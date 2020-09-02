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
        new BindHijackPlugin([]);

        // 其他插件
    ]
}
```

### 实现拦截函数
使用wxa运行时插件为每个页面注入拦截函数，否则会找不到事件处理函数
```javascript
/**
 * wxa plugin
 */
import $$log from '@/services/log';

export default ()=>(vm, type)=>{
    if (['Page', 'Component'].indexOf(type) == -1) return;
    /**
     * 1. 拦截所有事件
     *
     * 拦截函数统一为 wxaHijack
     */
    vm.wxaHijack = function(e){
        // do sth, ie: log
        $$log('tap event', e);

        // execute origin funtion
        let originHandler = e.currentTarget.dataset.originHandler;
        if(originHandler && this[originHandler]){
            this[originHandler].bind(this)(e);
        }else{
            console.log(`${originHandler}方法不存在`);
        }
    }

    /**
     * 2. 指定拦截事件
     *
     * 拦截函数命名为：  wxaHijack + 事件名，驼峰风格
     * 即：`wxaHijack${event[0].toUpperCase()}${event.substr(1)}`;
     */
    vm.wxaHijackTap = function(e){
        console.log('tap event fired!');
    }
    wm.wxaHijackGetuserinfo = function(e){
        console.log('getuserinfo event fired!');
    }
}
```

### 其他说明
1. 拦截事件支持bind和catch（阻止冒泡），支持冒号写法（bind:tap）
2. 自动执行执行的事件也会触发拦截，如：swiper设置了autoplay时，bindchange事件会自动执行
3. 事件对象的dataset中注入节点相关信息，包括：data、type、class、id
