---
nav: english
search: english
sidebar: true
---

# wxa-core

[![Build Status](https://travis-ci.org/Genuifx/wxa.svg?branch=master)](https://travis-ci.org/Genuifx/wxa)
[![NPM version](https://img.shields.io/npm/v/@wxa/core.svg)](https://www.npmjs.com/package/@wxa/core)
[![codecov](https://codecov.io/gh/Genuifx/wxa/branch/master/graph/badge.svg)](https://codecov.io/gh/Genuifx/wxa)

A tiny library for improving  Wechat Mini programs development.:laughing:

use [`@wxa/cli`](https://github.com/Genuifx/wxa-cli) for better experiment.:smirk:

## Feature
- Mixins
- Promisify
- Decorator
- Router
- Eventbus
- Redux

## Usage
### App
```
    import {wxa, App} from '@wxa/core';

    @App
    class Main{
        //your logic here
    }
    // start up app
    wxa.launchApp(Main);
```
### Page
```
    import {wxa, Page} from '@wxa/core';

    @Page
    class Index{
        //your logic here
    }
    // start up app
    wxa.launchPage(Index);
```
### mixins
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
## Api
### Storage
useful, convenient methods for interact with wx.storage*
- **set**: preserve data with wx.setStorageSync;
`this.storage.set(key, data)`
- **get**: get data from storage;
`let data = this.storage.get(key)`
- **clear**: clean up storage, delete all data;
`this.storage.clear()`
- **remove**: remove target the data;
`this.storage.remove(key)`
### Wxapi
wrap Mini program's async function with promise, and do nothing with the sync function
example:
1. navigateToMiniProgram
```javascript
this.wxapi.navigateToMiniProgram({params})
.then(succ=>{}).catch(fail=>{})
```
2. setStorageSync
```javascript
let value = this.wxapi.getStorageSync(key);
```
### Utils
helper function
### Router
similar API pattern to vue-router, just wrap the mini programs navigate methods;
### Eventbus
eventbus
### Logger
logger to report err or user behavior to your remote server.

## Redux
use redux to manage your application's page state
url: https://github.com/Genuifx/wxa-redux.git

