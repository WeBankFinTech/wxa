# wxa-plugin-bind-hijack

[![NPM version](https://img.shields.io/npm/v/@wxa/plugin-replace.svg)](https://www.npmjs.com/package/@wxa/plugin-replace)

劫持小程序bind事件，目前暂仅支持拦截tap

## install
```
npm install -S @wxa/plugin-bind-hijack
```


## Usage
### import plugin
```javascript
const BindCapturePlugin = require('@wxa/plugin-bind-capture');

new BindCapturePlugin([
    'tap', // 默认值
    'getuserinfo',
]),
```

### add wxaTapCapture functionn
```javascript
/**
 * wxa plugin
 */
import $$log from '@/services/log';

export default ()=>(vm, type)=>{
    if (['Page', 'Component'].indexOf(type) == -1) return;
    /**
     * 拦截函数命名为：  wxaHijack + 事件名，驼峰
     * 即：`wxaHijack${event[0].toUpperCase()}${event.substr(1)}`;
     */
    vm.wxaHijackTap = function(e){
        // do sth, ie: log
        $$log('tap event', e);
        // execute origin funtion
        let tap = e.currentTarget.dataset.tap || e.target.dataset.tap;
        if(tap && this[tap]){
            this[tap].bind(this)(e);
        }else{
            console.log(`${tap}方法不存在`);
        }
    }
    wm.wxaHijackGetuserinfo = function(e){
        console.log('getuserinfo fire');
    }
}
```
