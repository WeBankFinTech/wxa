# wxa-redux
[![Build Status](https://travis-ci.org/Genuifx/wxa-redux.svg?branch=master)](https://travis-ci.org/Genuifx/wxa-redux)
[![NPM version](https://img.shields.io/npm/v/@wxa/redux.svg)](https://www.npmjs.com/package/@wxa/redux)
[![codecov](https://codecov.io/gh/Genuifx/wxa-redux/branch/master/graph/badge.svg)](https://codecov.io/gh/Genuifx/wxa-redux)    

redux for wxa.

:blush::blush::blush::blush:[Documentation](https://genuifx.github.io/wxa/plugin/core/redux.html)

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