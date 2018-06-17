# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

<a name="1.6.0-beta.c319b649"></a>
# 1.6.0-beta.c319b649 (2018-06-17)


### Features

* **logger, npmManager, progressBar:** add node-notifier to notify error, add npmManager to auto ins ([59d897e](https://github.com/Genuifx/wxa-cli/commit/59d897e))
* **wxa-plugin-postcss:** new plugin for wxa ([53cd590](https://github.com/Genuifx/wxa-cli/commit/53cd590))


### BREAKING CHANGES

* **wxa-plugin-postcss:** optimizeAssets hook will pass opath obj instea of code, cause developer always use
compilation.code and code is never used



<a name="1.0.0"></a>
# 1.0.0 (2018-06-05)


### Bug Fixes

* “ should be placed in regexp ([4691141](https://github.com/Genuifx/wxa-cli/commit/4691141))
* add windows compat in resolved path. fixed [#1](https://github.com/Genuifx/wxa-cli/issues/1) ([a886652](https://github.com/Genuifx/wxa-cli/commit/a886652))
* bug ([b497d23](https://github.com/Genuifx/wxa-cli/commit/b497d23))
* bug fix ([6b0d24a](https://github.com/Genuifx/wxa-cli/commit/6b0d24a))
* change regexp for require. drop ignore check. ([c2a3544](https://github.com/Genuifx/wxa-cli/commit/c2a3544))
* clearline in window ([0f5fac0](https://github.com/Genuifx/wxa-cli/commit/0f5fac0))
* cli should ignore comment ([dc1bad9](https://github.com/Genuifx/wxa-cli/commit/dc1bad9))
* fix regexp for something.require() ([a9c9cf3](https://github.com/Genuifx/wxa-cli/commit/a9c9cf3))
* new instance ([40c8b35](https://github.com/Genuifx/wxa-cli/commit/40c8b35))
* npmhack ([8bc46e1](https://github.com/Genuifx/wxa-cli/commit/8bc46e1))
* path fix up ([75c3c79](https://github.com/Genuifx/wxa-cli/commit/75c3c79))
* require support uri ([2c22c92](https://github.com/Genuifx/wxa-cli/commit/2c22c92))
* specially decode express in wxml ([0723709](https://github.com/Genuifx/wxa-cli/commit/0723709))
* spell ([ed2ef56](https://github.com/Genuifx/wxa-cli/commit/ed2ef56))
* use compile-config for json compile ([ef03e82](https://github.com/Genuifx/wxa-cli/commit/ef03e82))
* when find some files changed, we should clear schedule's record ([a74cebf](https://github.com/Genuifx/wxa-cli/commit/a74cebf))
* 修复wxs传递的ext类型 ([9657056](https://github.com/Genuifx/wxa-cli/commit/9657056))
* 路径修复 ([28dc29b](https://github.com/Genuifx/wxa-cli/commit/28dc29b))


### Features

* add compiler ([041c2eb](https://github.com/Genuifx/wxa-cli/commit/041c2eb))
* add logger and progress bar ([af0f3d8](https://github.com/Genuifx/wxa-cli/commit/af0f3d8))
* add schedule to manage compile task ([a69fed4](https://github.com/Genuifx/wxa-cli/commit/a69fed4))
* add template compile and cache ([43ee975](https://github.com/Genuifx/wxa-cli/commit/43ee975))
* basically finish build and watch feature ([92fcaec](https://github.com/Genuifx/wxa-cli/commit/92fcaec))
* compile component for npm ([a9c9447](https://github.com/Genuifx/wxa-cli/commit/a9c9447))
* compile npm's com ([b0efa2b](https://github.com/Genuifx/wxa-cli/commit/b0efa2b))
* make compiler plugable ([7b8944d](https://github.com/Genuifx/wxa-cli/commit/7b8944d))
* more comfort log ([d4d9d03](https://github.com/Genuifx/wxa-cli/commit/d4d9d03))
* parse component's path ([719aa3b](https://github.com/Genuifx/wxa-cli/commit/719aa3b))
* read babelrc or pkg.babel configurations ([35bc08c](https://github.com/Genuifx/wxa-cli/commit/35bc08c))
* store handled file incase of duplicated handle ([5b4026f](https://github.com/Genuifx/wxa-cli/commit/5b4026f))
* support create project ([8f11959](https://github.com/Genuifx/wxa-cli/commit/8f11959))
* support extension ([91856f5](https://github.com/Genuifx/wxa-cli/commit/91856f5))
* support no-cache ([3e889fd](https://github.com/Genuifx/wxa-cli/commit/3e889fd))
* support path alias ([94e29ca](https://github.com/Genuifx/wxa-cli/commit/94e29ca))
* use eventemitter to emit event ([69d5712](https://github.com/Genuifx/wxa-cli/commit/69d5712))
* use webpack/tapable for apply plugins ([6a2930e](https://github.com/Genuifx/wxa-cli/commit/6a2930e))
* wechatdevtool cli invoke ([ed55ebc](https://github.com/Genuifx/wxa-cli/commit/ed55ebc))
* 支持scope类型依赖指定文件 ([7daa457](https://github.com/Genuifx/wxa-cli/commit/7daa457))
