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
2. mixins
