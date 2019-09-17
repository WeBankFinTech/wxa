# @wxa/hooks

提供一套react hooks思想的方案应用到小程序。

目前实现的功能：
- withHooks
- useState
- useEffect

待实现的 hooks:
- useCallback

可以使用 `withHooks` 注册页面，具体用法参考[微信文档](https://developers.weixin.qq.com/miniprogram/dev/framework/custom-component/component.html);

## Usage And Definition 
- `npm run build` dist目录有相关接口定义。
- `yarn link` 在需要使用项目中再次运行 `yarn link "@wxa/hooks"` 即可使用。


## Example

```js
import {withHooks, useState, useEffect} from '@wxa/hooks';

withHooks(()=>{
    let [count, setCount] = useState(0);

    useEffect(()=>{
        console.log('counter changed');

        return ()=>{
            console.log('counter clean up');
        }
    }, [count])

    return {
        data: {
            count
        },
        methods: {
            bindtap: ({currentTarget: {dataset: {value}}})=>{
                setCount(count + +value);
            }
        }
    }
}, {
    properties: {
        btnText: {
            type: String,
            value: 'Add'
        },
        value: Number
    }
});
```