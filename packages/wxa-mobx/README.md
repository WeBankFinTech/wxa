# @wxa/mobx
[![NPM version](https://img.shields.io/npm/v/@wxa/mobx/next.svg)](https://www.npmjs.com/package/@wxa/mobx)
![npm bundle size (minified + gzip)](https://img.shields.io/bundlephobia/minzip/@wxa/mobx/next.svg)

[详细的文档](https://genuifx.github.io/wxa/plugin/core/mobx.html)

[More Detail Documentation](https://genuifx.github.io/wxa/plugin/core/mobx.html)


## 安装
``` bash
# 使用npm安装
npm i -S @wxa/mobx
```

## 用例
1. 在`app.js`/`app.wxa`中引入后注册。
``` js
// app.js or app.wxa
import {App, wxa} from '@wxa/core';
import mobxPlugin from '@wxa/mobx';

wxa.use(mobxPlugin);

@App
export default class Main {};
```

2. 在页面类中定义`store`对象。
``` js
import {Page} from '@wxa/core';

@Page
export default class Index {
    store = {
        a: 1,
        b: 2,
        c: '',
        syncData: '',
        count(){
            this.a++;
        },
        getSomeSync(){
            Api.getSomeSync().then(ret => {
                this.syncData =  'a';
            })
        }
    }
    onShow(){
        //自动绑定到appData
        conosle.log(this.data.a); // 1

        //数据变化监听
        this.$$store.count();
        conosle.log(this.data.a); // 2

        //异步监听
        this.$$store.getSomeSync();
        conosle.log(this.data.syncData); // a
    }
}
```

3. 全局状态
``` js
import { observable } from 'mobx';
import Api from "@/services/api";

class userInfoStore {

    @observable name = '';
    @observable sex = '';

    getUserInfo = async () => {
        const userInfo = await Api.get();
        this.name = userInfo.name;
        this.sex = userInfo.sex;
    }

    setName(name){
        this.name = name;
    }

}

export default new userInfoStore(); //导出单例
```

``` js
import {Page} from '@wxa/core';
import userInfoStore from '@/store/userInfo'
@Page
export default class Index {
    store = {
        userInfoStore
    }
    onShow(){
        this.$$store.userInfoStore.getUserInfo();
        console.log(this.data.userInfoStore.name); // some name

        this.$$store.userInfoStore.setName('sb');
        console.log(this.data.userInfoStore.name); // sb
    }
}
```
