# wxa-redux
[![Build Status](https://travis-ci.org/Genuifx/wxa-redux.svg?branch=master)](https://travis-ci.org/Genuifx/wxa-redux)
[![NPM version](https://img.shields.io/npm/v/@wxa/redux.svg)](https://www.npmjs.com/package/@wxa/redux)
[![codecov](https://codecov.io/gh/Genuifx/wxa-redux/branch/master/graph/badge.svg)](https://codecov.io/gh/Genuifx/wxa-redux)    

redux for wxa.
# Usage
```javascript
// app.wxa app.js
import wxa from '@wxa/core'
import {wxaRedux, combineReducers} from '@wxa/redux'
import promiseMiddleware from 'redux-promise';
wxa.use(wxaRedux, {
    reducers: combineReducers(...your reducer),
    middlewares: [promiseMiddleware]
})
```

```javascript
// page.js
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
```