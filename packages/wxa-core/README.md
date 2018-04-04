# wxa-core

[![Build Status](https://travis-ci.org/Genuifx/wxa.svg?branch=master)](https://travis-ci.org/Genuifx/wxa)
[![NPM version](https://img.shields.io/npm/v/@wxa/core.svg)](https://www.npmjs.com/package/@wxa/core)
[![codecov](https://codecov.io/gh/Genuifx/wxa/branch/master/graph/badge.svg)](https://codecov.io/gh/Genuifx/wxa)

A tiny library for improving  Wechat Mini programs development.:laughing:

use [`@wxa/cli`](https://github.com/Genuifx/wxa-cli) for better experiment.:smirk:

Detail documents: [@wxa/doc](https://genuifx.github.io/wxa-doc/#/lang/english/):100:

更完善的文档：[@wxa/doc](https://genuifx.github.io/wxa-doc/#/home):100:

# Feature
- [x] Mixins
- [x] Promisify
- [x] Decorator
- [x] Router
- [x] Eventbus
- [x] Redux

# Usage
## App
```
    import {wxa, App} from '@wxa/core';

    @App
    class Main{
        //your logic here
    }
    // start up app
    wxa.launchApp(Main);
```
## Page
```
    import {wxa, Page} from '@wxa/core';

    @Page
    class Index{
        //your logic here
    }
    // start up app
    wxa.launchPage(Index);
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
