# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [2.2.0](https://github.com/wxajs/wxa/compare/v2.1.14...v2.2.0) (2020-07-06)


### Features

* **@wxa/redux:** add data field size detect, filter ([d9d49f0](https://github.com/wxajs/wxa/commit/d9d49f0ac345129e6429abb8727f68a56472964e))
* **@wxa/redux:** support reducer registry for lazy load model in subpackage ([c10bbe5](https://github.com/wxajs/wxa/commit/c10bbe557bba8f124f72307e8572b0a7bfb72cb4))
* **directive:** 开启wxa指令功能,新增wxa:mock指令 ([f3114ab](https://github.com/wxajs/wxa/commit/f3114ab8a0ca860f465386150f40358b7f928fcf))
* **redux:** add wechat storage methods ([4f97273](https://github.com/wxajs/wxa/commit/4f97273a51d0004786e82642388843b57821eaf3))
* **redux:** deep clone the diff data to avoid effect referrence data ([3ff98ac](https://github.com/wxajs/wxa/commit/3ff98ac1526f6bef68f7598532f0f065f7fe138c))
* **redux:** offer a method to get store instance ([8f7a71f](https://github.com/wxajs/wxa/commit/8f7a71f7188442102f96fcd9b25c8b12aa8dd242))
* **redux:** support applied middlewares, add debug mode ([f85d7f6](https://github.com/wxajs/wxa/commit/f85d7f65ed80ea3c889e7b85accf6ff8a6678047))


### BREAKING CHANGES

* **redux:** middlewares not can be handled by user.





# [2.1.0](https://github.com/wxajs/wxa/compare/v2.0.8...v2.1.0) (2019-08-28)

**Note:** Version bump only for package @wxa/redux





# 2.0.0-rc.1 (2019-02-01)



# 2.0.0-rc.1 (2019-02-01)



# 2.0.0-rc.0 (2019-01-28)


### Bug Fixes

* **redux:** add default reducers ([f583ec4](https://github.com/wxajs/wxa/commit/f583ec4))
* **watch-wxa-plugin:** can not drop onload, unload fn and watcher. ([7b84a73](https://github.com/wxajs/wxa/commit/7b84a73))
* add compat detect ([0df20d4](https://github.com/wxajs/wxa/commit/0df20d4))
* bug ([2ea2883](https://github.com/wxajs/wxa/commit/2ea2883))
* bug ([a5ca4a1](https://github.com/wxajs/wxa/commit/a5ca4a1))
* detect vm.app ([8354aa7](https://github.com/wxajs/wxa/commit/8354aa7))
* map store to app.store ([dfef4b7](https://github.com/wxajs/wxa/commit/dfef4b7))
* record last state so that we can make state transform ([113e4bc](https://github.com/wxajs/wxa/commit/113e4bc))
* vm->this ([778f3f8](https://github.com/wxajs/wxa/commit/778f3f8))
* 修复bug，增加单元测试 ([5c7d92c](https://github.com/wxajs/wxa/commit/5c7d92c))


### Features

* **logger, npmManager, progressBar:** add node-notifier to notify error, add npmManager to auto ins ([80f0279](https://github.com/wxajs/wxa/commit/80f0279))
* **redux:** add diff support for redux data ([8cd52c5](https://github.com/wxajs/wxa/commit/8cd52c5))
* 支持注入到component ([e28546e](https://github.com/wxajs/wxa/commit/e28546e))


### Performance Improvements

* **core:** initial plugin with options once. ([932d0a9](https://github.com/wxajs/wxa/commit/932d0a9))


### BREAKING CHANGES

* **core:** plugin only initial options once.
