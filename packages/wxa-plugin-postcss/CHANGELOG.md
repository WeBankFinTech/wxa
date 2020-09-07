# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [2.2.0](https://github.com/wxajs/wxa/compare/v2.1.14...v2.2.0) (2020-07-06)

**Note:** Version bump only for package @wxa/plugin-postcss





# 2.0.0-rc.1 (2019-02-01)



# 2.0.0-rc.1 (2019-02-01)



# 2.0.0-rc.0 (2019-01-28)


### Bug Fixes

* **watch-wxa-plugin:** can not drop onload, unload fn and watcher. ([7b84a73](https://github.com/wxajs/wxa/commit/7b84a73))


### Features

* **wxa-plugin-postcss:** new plugin for wxa ([17e3f8a](https://github.com/wxajs/wxa/commit/17e3f8a))


### BREAKING CHANGES

* **wxa-plugin-postcss:** optimizeAssets hook will pass opath obj instea of code, cause developer always use
compilation.code and code is never used
