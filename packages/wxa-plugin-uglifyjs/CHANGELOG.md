# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [2.2.0](https://github.com/wxajs/wxa/compare/v2.1.14...v2.2.0) (2020-07-06)

**Note:** Version bump only for package @wxa/plugin-uglifyjs





# 2.0.0-rc.1 (2019-02-01)



# 2.0.0-rc.1 (2019-02-01)



# 2.0.0-rc.0 (2019-01-28)


### Bug Fixes

* **plugin-uglifyjs:** regexp wrong ([ad0125f](https://github.com/wxajs/wxa/commit/ad0125f))
* **watch-wxa-plugin:** can not drop onload, unload fn and watcher. ([7b84a73](https://github.com/wxajs/wxa/commit/7b84a73))
* ext ([626f772](https://github.com/wxajs/wxa/commit/626f772))
* name of plugin ([df604ff](https://github.com/wxajs/wxa/commit/df604ff))
* use compilation's code ([d75b282](https://github.com/wxajs/wxa/commit/d75b282))


### Features

* **logger, npmManager, progressBar:** add node-notifier to notify error, add npmManager to auto ins ([80f0279](https://github.com/wxajs/wxa/commit/80f0279))
* **replace and uglifyjs plugin:** add replace and uglifyjs plugin support ([711ac6f](https://github.com/wxajs/wxa/commit/711ac6f))
* **wxa-plugin-postcss:** new plugin for wxa ([17e3f8a](https://github.com/wxajs/wxa/commit/17e3f8a))


### BREAKING CHANGES

* **wxa-plugin-postcss:** optimizeAssets hook will pass opath obj instea of code, cause developer always use
compilation.code and code is never used
