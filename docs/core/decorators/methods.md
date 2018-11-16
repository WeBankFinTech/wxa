# Methods装饰器
顾名思义，即作用于具体的类成员函数上的装饰器。

Methods装饰器有着广泛的用途。

## Debounce
- **调用方式**
    - `@Debounce( wait, [options={}] )`
    - `@Debounce`
- **参数**
    - **wait**: `Number` 延时多少毫秒之后执行函数 **Default**: 300 
    - **options**: `Object` 参数对象 
        - **leading**: `Boolean` 指定是否在超时之前触发函数。 **Default**: `true`
        - **maxWait**: `Number` 在函数触发前最大延时时间。
        - **trailing**: `Boolean` 指定是否在超时之后触发函数。 **Default**: `false`
- **用例**: 

```js
import { Page, Debounce } from '@wxa/core';

@Page
export default class Index {
    // 默认立刻执行函数，并且在一定延迟之内不会重复执行。
    @Debounce
    tap() {
        this.$router.push('pages/index');
    }

    // 指定延迟时间
    @Debounce(1000)
    longTap({detail: value}) {
        this.setData({
            phone: value
        })
    }
}
```

debounce，又称反抖动函数。大量应用于控制用户交互事件行为（点击，滑动等），由于用户可能误触引发事件回调，如果不加以控制，可能引起重复的后台请求。

故而，几乎所有用户交互事件都需要开发者做对应控制，这个时间一个Debounce装饰器可以帮助你优雅的开发业务代码:heart_eyes:

::: tip 提示
debounce函数，详见[`lodash debounce`](https://lodash.com/docs/4.17.10#debounce);
:::

## Delay
- **调用方式**
    - `@Delay( wait )`
- **参数**
    - **wait**: `Number` 延时多少毫秒之后执行函数
- **用例**: 
```js
import { Page, Delay } from '@wxa/core';

@Page
export default class Index {
    // 延迟1000ms之后执行函数
    @Delay(1000)
    sleepAndTravel() {
        this.$router.push('pages/index');
    }
}
```

延迟一段时间后执行函数。

::: tip 提示
delay函数，详见[`lodash delay`](https://lodash.com/docs/4.17.10#delay);
:::

## Deprecate
- **调用方式**
    - `@Deprecate`
- **用例**: 
```js
import { App, Deprecate } from '@wxa/core';

@App
export default class Index {
    // 延迟1000ms之后执行函数
    @Deprecate
    foo() {}
}
```

开发第三方的组件或者多人合作情况下，标识某些方法即将遗弃。继续调用该方法会有一个warning。

## Loading
- **调用方式**
    - `@Loading( tips, type )`
- **参数**
    - **tips**: `String` loading的文案提示 **Default** `Loading`
    - **type**: `String` 类型，可以指定使用导航栏loading动画或者界面loading动画 **Default** `loading`
- **用例**: 

自动显示loading动画。有两种类型`loading`或`bar`，分别是界面的loading动画及导航栏的动画。

## Lock
- **调用方式**
    - `@Lock`
- **用例**: 

Lock装饰器，与后台的事务锁不同，wxa的锁主要用于防止函数重复执行。在日常开发中，前端防重一直是个很重要的问题。在不用`Lock`的情况下，我们需要对每个函数都增加一个变量控制：

```js
import {Page} from '@wxa/core';

@Page
export default class Index {
    async login() {
        // 是否在做登录中，防止重复登录
        if(this.isLoging) return;
        this.isLoging = true;

        try {
            // 获取微信的code，用于从微信后台换取sessionKey
            let {code} = await this.$wxapi.login();
            // 后台提供的登录接口
            await this.$fetch('/remote/login', {code}, {}, 'POST');
            // 登录完成，记录状态
            this.setData({
                isLogged: true
            });
        } catch(e) {
            console.error(e);
        }

        // 重置标志位
        this.isLoging = false;
    }
}
```

而使用`Lock`之后，我们无需关心太多控制逻辑，代码更加清晰了然。

```js
import {Lock, Page, toast} from '@wxa/core';

@Page 
export default class Index {
    @Lock
    async login() {
        try {
            // 获取微信的code，用于从微信后台换取sessionKey
            let {code} = await this.$wxapi.login();
            // 后台提供的登录接口
            await this.$fetch('/remote/login', {code}, {}, 'POST');
            // 登录完成，记录状态
            this.setData({
                isLogged: true
            });
        } catch(e) {
            toast('登录失败~');
        }
    }
}
```

## Once
- **调用方式**
    - `@Once`
- **用例**: 

指定函数仅会执行一次，重复的调用只会返回第一次调用的结果。详见[`lodash Once`](https://lodash.com/docs/4.17.10#once);

## Throttle
- **调用方式**
    - `@Throttle( wait, [options={}] )`
    - `@Throttle`
- **参数**
    - **wait**: `Number` 每隔`wait`毫秒仅执行函数一次 **Default**: 1000 
    - **options**: `Object` 参数对象 
        - **leading**: `Boolean` 指定是否在超时之前触发函数。 **Default**: `true`
        - **trailing**: `Boolean` 指定是否在超时之后触发函数。 **Default**: `true`
- **用例**: 

限流函数。一般适用于持续高频触发的交互，比如`input`，`scroll`等短时间内有可能多次触发回调函数，密集的计算可能导致界面卡顿问题，这个时候一个限流函数就大有用武之地了。
