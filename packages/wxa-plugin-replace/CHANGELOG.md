# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [2.2.0](https://github.com/wxajs/wxa/compare/v2.1.14...v2.2.0) (2020-07-06)

**Note:** Version bump only for package @wxa/plugin-replace





# 2.0.0-rc.1 (2019-02-01)



# 2.0.0-rc.1 (2019-02-01)



# 2.0.0-rc.0 (2019-01-28)


### Bug Fixes

* **plugin-replace:** code->compilation.code, config array should first judge array ([060e7a8](https://github.com/wxajs/wxa/commit/060e7a8))
* **watch-wxa-plugin:** can not drop onload, unload fn and watcher. ([7b84a73](https://github.com/wxajs/wxa/commit/7b84a73))
* name of plugin ([22025d6](https://github.com/wxajs/wxa/commit/22025d6))
* use compilation code ([a2725f6](https://github.com/wxajs/wxa/commit/a2725f6))


### Features

* **logger, npmManager, progressBar:** add node-notifier to notify error, add npmManager to auto ins ([80f0279](https://github.com/wxajs/wxa/commit/80f0279))
* **replace and uglifyjs plugin:** add replace and uglifyjs plugin support ([711ac6f](https://github.com/wxajs/wxa/commit/711ac6f))
* **wxa-plugin-postcss:** new plugin for wxa ([17e3f8a](https://github.com/wxajs/wxa/commit/17e3f8a))
* support object configs ([dd405b6](https://github.com/wxajs/wxa/commit/dd405b6))


### BREAKING CHANGES

* **wxa-plugin-postcss:** optimizeAssets hook will pass opath obj instea of code, cause developer always use
compilation.code and code is never used
