# wxa-redux
[![Build Status](https://travis-ci.org/Genuifx/wxa-redux.svg?branch=master)](https://travis-ci.org/Genuifx/wxa-redux)
[![NPM version](https://img.shields.io/npm/v/@wxa/redux.svg)](https://www.npmjs.com/package/@wxa/redux)
[![codecov](https://codecov.io/gh/Genuifx/wxa-redux/branch/master/graph/badge.svg)](https://codecov.io/gh/Genuifx/wxa-redux)    

redux for wxa.
# Usage
1. mount wxa-redux to wxa's instance.

```javascript
// app.wxa app.js
import {wxa} from '@wxa/core'
import {wxaRedux, combineReducers} from '@wxa/redux'
import promiseMiddleware from 'redux-promise';

wxa.use(wxaRedux, {
    reducers: combineReducers(...your reducer),
    middlewares: [promiseMiddleware]
})
```

2. add map to your page

```javascript
// page.js
import {Page, wxa} from '@wxa/core'

@Page
class Index {
    mapState = {
        todolist : (state)=>state.todo
    }
    methods = {
        bindtap() {
            // dispatch your commit here
            this.store.dispatch({type: 'Add_todo_list', payload: 'coding today'});
            // and your page data will auto update.
        }
    }
} 

wxa.launchPage(Index)

```

3. add map to your Component

```javascript
// component.js
import {GetApp} from '@wxa/core'

// redux need mount app to com.
@GetApp
class Com {
    mapState = {
        todolist : (state)=>state.todo
    }
    methods = {
        bindtap() {
            // dispatch your commit here
            this.store.dispatch({type: 'Add_todo_list', payload: 'coding today'});
            // and your page data will auto update.
        }
    }
} 

wxa.launchComponent(Com);
```

# Technical Detail
wxa-redux has different tasks to do according to current type.  while in App layer, wr just create a store and mount store in the app.  But in Page or Component layer, wr do a lot for users. 

1. App
create store, apply middelware and mount store in app.

2. Page
we do different staff on essential life hook
- `onLoad`  wr subscribe to `app.store` and add a unsubscribe function to the instance. 
- `onShow` mark instance with `$isCurrentPage`, do once map state
- `onHide` reset `$isCurrentPage` so that data will not update while page not at the front
- `onUnload` unsubscribe change

3. Component
also doing little thing for com
- `created` mount store    
- `attached` subscribe state change
- `detached` unsubscribe