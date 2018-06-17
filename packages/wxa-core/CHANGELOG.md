# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

<a name="1.5.0-beta.c319b649"></a>
# 1.5.0-beta.c319b649 (2018-06-17)


### Features

* **logger, npmManager, progressBar:** add node-notifier to notify error, add npmManager to auto ins ([59d897e](https://github.com/Genuifx/wxa/commit/59d897e))



<a name="1.0.0"></a>
# 1.0.0 (2018-06-05)


### Bug Fixes

* bind this to component methods ([a65cbba](https://github.com/Genuifx/wxa/commit/a65cbba))
* onShareAppMessage shouldn't to be wrap ([3a9d010](https://github.com/Genuifx/wxa/commit/3a9d010))
* **app.js, page.js, component.js:** prototype methods should cover function defined in methods objec ([9b33f23](https://github.com/Genuifx/wxa/commit/9b33f23))
* **decorators.js:** add options control for decorator ([94ae26d](https://github.com/Genuifx/wxa/commit/94ae26d))
* **page.js:** debounce should use leading mode ([5d01338](https://github.com/Genuifx/wxa/commit/5d01338))
* **page.js, component.js, app.js:** do not copy constructor ([140729f](https://github.com/Genuifx/wxa/commit/140729f))


### Features

* featch api, fix some bug ([6452888](https://github.com/Genuifx/wxa/commit/6452888))
* fetch api, add some test stuff ([dfc6b5b](https://github.com/Genuifx/wxa/commit/dfc6b5b))
* mixins support nesting copy ([c4a4240](https://github.com/Genuifx/wxa/commit/c4a4240))
* support directly write function in class ([55f3270](https://github.com/Genuifx/wxa/commit/55f3270))
* support mixins and add a example application ([107610b](https://github.com/Genuifx/wxa/commit/107610b))
* **(decorators.js):** add Mixins decorator ([68b74e9](https://github.com/Genuifx/wxa/commit/68b74e9))
* **fetch.js:** response without 200 statusCode will reject ([002517d](https://github.com/Genuifx/wxa/commit/002517d))
* **fetch.js:** setRequestExpiredTime allow set up per request's expired time ([b7fa527](https://github.com/Genuifx/wxa/commit/b7fa527))
* **wxa.js, message, toast:** export some lodash function, add message and toast function for using. ([37ef20b](https://github.com/Genuifx/wxa/commit/37ef20b))


### BREAKING CHANGES

* **fetch.js:** response without 200 statusCode will reject
* **app.js, page.js, component.js:** if user define two same name function both in class and class.methods object, the
one in class prototype will cover methods object one.




<a name="1.4.4"></a>
## [1.4.4](https://github.com/Genuifx/wxa/compare/v1.4.3...v1.4.4) (2018-05-17)


### Bug Fixes

* **app.js, page.js, component.js:** prototype methods should cover function defined in methods objec ([a8db03f](https://github.com/Genuifx/wxa/commit/a8db03f))


### BREAKING CHANGES

* **app.js, page.js, component.js:** if user define two same name function both in class and class.methods object, the
one in class prototype will cover methods object one.



<a name="1.4.3"></a>
## [1.4.3](https://github.com/Genuifx/wxa/compare/v1.4.2...v1.4.3) (2018-05-14)


### Bug Fixes

* **page.js, component.js, app.js:** do not copy constructor ([6e28c50](https://github.com/Genuifx/wxa/commit/6e28c50))



<a name="1.4.2"></a>
## [1.4.2](https://github.com/Genuifx/wxa/compare/v1.4.1...v1.4.2) (2018-05-14)


### Bug Fixes

* **decorators.js:** add options control for decorator ([82fffd9](https://github.com/Genuifx/wxa/commit/82fffd9))
* **page.js:** debounce should use leading mode ([c62b0b7](https://github.com/Genuifx/wxa/commit/c62b0b7))


### Features

* **fetch.js:** setRequestExpiredTime allow set up per request's expired time ([2bb5fc2](https://github.com/Genuifx/wxa/commit/2bb5fc2))
* **wxa.js, message, toast:** export some lodash function, add message and toast function for using. ([0874650](https://github.com/Genuifx/wxa/commit/0874650))



<a name="1.4.1"></a>
## [1.4.1](https://github.com/Genuifx/wxa/compare/v1.4.0...v1.4.1) (2018-05-13)


### Features

* **(decorators.js):** add Mixins decorator ([6589538](https://github.com/Genuifx/wxa/commit/6589538))



<a name="1.4.0"></a>
# [1.4.0](https://github.com/Genuifx/wxa/compare/v1.3.1...v1.4.0) (2018-05-12)


### Features

* support directly write function in class ([2757f35](https://github.com/Genuifx/wxa/commit/2757f35))



<a name="1.3.1"></a>
## [1.3.1](https://github.com/Genuifx/wxa/compare/v1.3.0...v1.3.1) (2018-05-08)



<a name="1.3.0"></a>
# [1.3.0](https://github.com/Genuifx/wxa/compare/v1.2.1...v1.3.0) (2018-05-08)


### Features

* fetch api, add some test stuff ([12c3cc8](https://github.com/Genuifx/wxa/commit/12c3cc8))



<a name="1.2.1"></a>
## [1.2.1](https://github.com/Genuifx/wxa/compare/v1.2.0...v1.2.1) (2018-04-04)



<a name="1.2.0"></a>
# [1.2.0](https://github.com/Genuifx/wxa/compare/v1.1.7...v1.2.0) (2018-03-22)



<a name="1.1.7"></a>
## [1.1.7](https://github.com/Genuifx/wxa/compare/v1.1.6...v1.1.7) (2018-03-22)


### Features

* featch api, fix some bug ([1fc30de](https://github.com/Genuifx/wxa/commit/1fc30de))



<a name="1.1.6"></a>
## [1.1.6](https://github.com/Genuifx/wxa/compare/v1.1.5...v1.1.6) (2018-02-23)


### Features

* mixins support nesting copy ([83fb2e3](https://github.com/Genuifx/wxa/commit/83fb2e3))



<a name="1.1.5"></a>
## [1.1.5](https://github.com/Genuifx/wxa/compare/v1.1.4...v1.1.5) (2018-02-18)


### Bug Fixes

* bind this to component methods ([b98eddb](https://github.com/Genuifx/wxa/commit/b98eddb))



<a name="1.1.4"></a>
## [1.1.4](https://github.com/Genuifx/wxa/compare/v1.1.3...v1.1.4) (2018-02-07)



<a name="1.1.3"></a>
## [1.1.3](https://github.com/Genuifx/wxa/compare/v1.1.2...v1.1.3) (2018-02-01)



<a name="1.1.2"></a>
## [1.1.2](https://github.com/Genuifx/wxa/compare/v1.1.1...v1.1.2) (2018-01-31)


### Bug Fixes

* onShareAppMessage shouldn't to be wrap ([3d186a3](https://github.com/Genuifx/wxa/commit/3d186a3))



<a name="1.1.1"></a>
## [1.1.1](https://github.com/Genuifx/wxa/compare/v1.1.0...v1.1.1) (2018-01-31)



<a name="1.1.0"></a>
# [1.1.0](https://github.com/Genuifx/wxa/compare/v1.0.1...v1.1.0) (2018-01-31)



<a name="1.0.1"></a>
## [1.0.1](https://github.com/Genuifx/wxa/compare/538bcf0...v1.0.1) (2018-01-29)


### Features

* support mixins and add a example application ([538bcf0](https://github.com/Genuifx/wxa/commit/538bcf0))
