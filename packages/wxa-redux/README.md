# wxa-redux
redux version for wxa.
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