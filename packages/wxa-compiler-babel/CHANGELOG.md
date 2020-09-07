# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [2.2.0](https://github.com/wxajs/wxa/compare/v2.1.14...v2.2.0) (2020-07-06)


### Features

* **compiler-babel:** Sourcemap generate ([5074b5e](https://github.com/wxajs/wxa/commit/5074b5ee4481dc7dc336eda1cf863343eb0980c9))





# 2.0.0-rc.1 (2019-02-01)



# 2.0.0-rc.1 (2019-02-01)



# 2.0.0-rc.0 (2019-01-28)


### Bug Fixes

* **babel:** constructure should same as build ([70255b6](https://github.com/wxajs/wxa/commit/70255b6))
* **babel:** dependencies ([5d200e2](https://github.com/wxajs/wxa/commit/5d200e2))
* **babel:** if code is an empty string, babel transform will raise error, so just bypass it. ([1f5b486](https://github.com/wxajs/wxa/commit/1f5b486))
* **cli:** add support for wxa1.0 config ([ee8b6e9](https://github.com/wxajs/wxa/commit/ee8b6e9))
* **cli:** clean up terminal print out with progressTextBar ([ebe4264](https://github.com/wxajs/wxa/commit/ebe4264))
* **compiler-babel:** [@babel](https://github.com/babel)/core -> babel-core ([331830f](https://github.com/wxajs/wxa/commit/331830f))
* **compiler-babel:** assign default value ([6215044](https://github.com/wxajs/wxa/commit/6215044))
* **compiler-babel:** default configs should be assigned ([12c6944](https://github.com/wxajs/wxa/commit/12c6944))
* **compiler-babel:** transform for babel-core, transformSync for [@babel](https://github.com/babel)/core ([05416ee](https://github.com/wxajs/wxa/commit/05416ee))
* **plugin-uglifyjs:** regexp wrong ([ad0125f](https://github.com/wxajs/wxa/commit/ad0125f))
* **watch-wxa-plugin:** can not drop onload, unload fn and watcher. ([7b84a73](https://github.com/wxajs/wxa/commit/7b84a73))


### Features

* **@wxa/compiler-babel upgrade to 2.0:** migrate to babel7, upgrade api for [@wxa](https://github.com/wxa)/cli@2.0+ ([ac2ce6c](https://github.com/wxajs/wxa/commit/ac2ce6c))
* **babel loader:** upgrade wxa-loader-babel ([dc69225](https://github.com/wxajs/wxa/commit/dc69225))
* **babel, sass, schedule:** add cache control to babel loader, add content field to each module ([b3bdd65](https://github.com/wxajs/wxa/commit/b3bdd65))
* **cli:** refactory logger, beautify output ([2b5e0ad](https://github.com/wxajs/wxa/commit/2b5e0ad))
* **logger, npmManager, progressBar:** add node-notifier to notify error, add npmManager to auto ins ([80f0279](https://github.com/wxajs/wxa/commit/80f0279))
* **sass-loader:** sass-loader ([bacbe4c](https://github.com/wxajs/wxa/commit/bacbe4c))
* **third party mode:** support build multi project once ([dd2bb83](https://github.com/wxajs/wxa/commit/dd2bb83))
