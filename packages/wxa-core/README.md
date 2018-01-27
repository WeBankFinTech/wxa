# wxa-core
enhanced library for develop wechat miniprogram.

# Usage
## App
```
    import {app, App, Page} from '@wxa/core';

    @App
    class Main{
        //your logic here
    }
    // start up app
    app.launch(Main);
```
## Page
```
    import {app, App, Page} from '@wxa/core';

    @Page
    class Index{
        //your logic here
    }
    // start up app
    page.launch(Index);
```
## mixins
support mixin object;
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
```javascript
    // page instance

    @Page
    class Index{
        mixins = [common]
        //your logic here
    }
```
# Api
## Storage
useful, convenient methods for interact with wx.storage*
## Wxapi
promise wrap miniprogram's async function
## Utils
helper function
## Router
similar api pattern to vue-router, just wrap the miniprogram's navigate methods;
## Eventbus
eventbus
## Logger
logger to report err or user behavior to your remote server.

# Todo
1. redux

