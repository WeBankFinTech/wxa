<a name="2.0.0-rc.1"></a>
# 2.0.0-rc.1 (2019-02-01)



<a name="2.0.0-rc.1"></a>
# 2.0.0-rc.1 (2019-02-01)



<a name="2.0.0-rc.0"></a>
# 2.0.0-rc.0 (2019-01-28)


### Bug Fixes

* **app.js, page.js, component.js:** prototype methods should cover function defined in methods objec ([5536c93](https://github.com/wxajs/wxa/commit/5536c93))
* **core:** add Functionn.prototype.bind polyfill for low version IOS ([3ada9ce](https://github.com/wxajs/wxa/commit/3ada9ce))
* **core:** export fetch function ([3c656a5](https://github.com/wxajs/wxa/commit/3c656a5))
* **core:** get app after App is launch ([e7e06c4](https://github.com/wxajs/wxa/commit/e7e06c4))
* **decorators.js:** add options control for decorator ([5e7bdb4](https://github.com/wxajs/wxa/commit/5e7bdb4))
* **page.js:** debounce should use leading mode ([9de50b9](https://github.com/wxajs/wxa/commit/9de50b9))
* **page.js app.js:** life hook in mixin file  was covered by page(app) hook ([49a2304](https://github.com/wxajs/wxa/commit/49a2304))
* **page.js, component.js, app.js:** do not copy constructor ([20d43de](https://github.com/wxajs/wxa/commit/20d43de))
* **plugin-uglifyjs:** regexp wrong ([ad0125f](https://github.com/wxajs/wxa/commit/ad0125f))
* **watch-wxa-plugin:** can not drop onload, unload fn and watcher. ([7b84a73](https://github.com/wxajs/wxa/commit/7b84a73))
* bind this to component methods ([50d9f42](https://github.com/wxajs/wxa/commit/50d9f42))
* onShareAppMessage shouldn't to be wrap ([9d708dc](https://github.com/wxajs/wxa/commit/9d708dc))


### Features

* **(decorators.js):** add Mixins decorator ([55692a0](https://github.com/wxajs/wxa/commit/55692a0))
* **@wxa/cli:** generate code right after depedency resolve ([509ec66](https://github.com/wxajs/wxa/commit/509ec66))
* **@wxa/core:** add debug mode, add pre-execute feature ([8f1025a](https://github.com/wxajs/wxa/commit/8f1025a))
* **core:** add no-promisify-api and bind polyfill for low version IOS and Android ([66a9e03](https://github.com/wxajs/wxa/commit/66a9e03))
* **core:** add setData callback for $diff fn ([8b75f44](https://github.com/wxajs/wxa/commit/8b75f44))
* **core:** Loading Decorator, test issue ([cac2e61](https://github.com/wxajs/wxa/commit/cac2e61))
* **core:** offer diff object feature for wxa ([885ca62](https://github.com/wxajs/wxa/commit/885ca62))
* **core:** support global mixin ([b52c423](https://github.com/wxajs/wxa/commit/b52c423))
* **core:** trace Page/Component/App instance's prototype to copy methods. ([15e5492](https://github.com/wxajs/wxa/commit/15e5492))
* **decorator:** migirate from legacy decorator ([fc821ad](https://github.com/wxajs/wxa/commit/fc821ad))
* **fetch.js:** response without 200 statusCode will reject ([6ca6bb7](https://github.com/wxajs/wxa/commit/6ca6bb7))
* **fetch.js:** setRequestExpiredTime allow set up per request's expired time ([6100dab](https://github.com/wxajs/wxa/commit/6100dab))
* **logger, npmManager, progressBar:** add node-notifier to notify error, add npmManager to auto ins ([80f0279](https://github.com/wxajs/wxa/commit/80f0279))
* **router, wxa:** add beforeRouteEnter hook ([d435cb1](https://github.com/wxajs/wxa/commit/d435cb1))
* **validate:** new creature ([6f69c33](https://github.com/wxajs/wxa/commit/6f69c33))
* **wxa.js, message, toast:** export some lodash function, add message and toast function for using. ([52e6cbc](https://github.com/wxajs/wxa/commit/52e6cbc))
* **wxa/core:** upgrade to babel7, rewrite wxa functionn ([c4cfce5](https://github.com/wxajs/wxa/commit/c4cfce5))
* featch api, fix some bug ([942d45b](https://github.com/wxajs/wxa/commit/942d45b))
* fetch api, add some test stuff ([34239dc](https://github.com/wxajs/wxa/commit/34239dc))
* mixins support nesting copy ([af0badb](https://github.com/wxajs/wxa/commit/af0badb))
* support directly write function in class ([3b160e7](https://github.com/wxajs/wxa/commit/3b160e7))
* support mixins and add a example application ([4b85a36](https://github.com/wxajs/wxa/commit/4b85a36))


### Performance Improvements

* **core:** initial plugin with options once. ([932d0a9](https://github.com/wxajs/wxa/commit/932d0a9))
* **core/diff:** reduce field from this.data with diff ([b7a82c5](https://github.com/wxajs/wxa/commit/b7a82c5))


### BREAKING CHANGES

* **core:** plugin only initial options once.
* **fetch.js:** response without 200 statusCode will reject
* **app.js, page.js, component.js:** if user define two same name function both in class and class.methods object, the
one in class prototype will cover methods object one.



