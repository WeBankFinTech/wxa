# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [2.2.0](https://github.com/wxajs/wxa/compare/v2.1.14...v2.2.0) (2020-07-06)


### Bug Fixes

* **cli:** add directive to stuff empty attributes ([b4147a9](https://github.com/wxajs/wxa/commit/b4147a93a258a9eb6e138a2dfa1e1639850e2949))
* **cli:** add rule check for all child module ([2573239](https://github.com/wxajs/wxa/commit/2573239f4c319e1bcc87191defa1b93eae09b280))
* **cli:** allow npm pkg name with dot ([8d3af86](https://github.com/wxajs/wxa/commit/8d3af862199f3f544fb2ab4ed713546849a28789))
* **cli:** drop useless code in mock ([73e9f2b](https://github.com/wxajs/wxa/commit/73e9f2bc9198237d9111df071e2aabe1f04b874f))
* **cli:** encode html entity while doing empty attributes stuff ([5af5c67](https://github.com/wxajs/wxa/commit/5af5c67ee43f8a166ee0d1b0e2d932648f8f306d))
* **cli:** fix config merge ([05cc3f5](https://github.com/wxajs/wxa/commit/05cc3f525314185f97d863858f2b049aea01724e))
* **cli:** fix right entry point for multi-project ([6b78b6b](https://github.com/wxajs/wxa/commit/6b78b6b4b36f45702202bc1d70f49da75a9366b4))
* **cli:** mustn't lowerCase attributes name or tags ([c2ca48d](https://github.com/wxajs/wxa/commit/c2ca48de13b8c61f4f8d143caf177daf1658fd48))
* **cli:** path bug ([bb2f77c](https://github.com/wxajs/wxa/commit/bb2f77c2464a8dfe910e79440ca41f1918f5f580))
* **cli:** 修复 issue [#43](https://github.com/wxajs/wxa/issues/43) ([bf539aa](https://github.com/wxajs/wxa/commit/bf539aa1ca54ad423a7e3b96476b5f7b2f28f68e))
* **cli:** 去除无用的指令, 修复class输出的bug ([a62f6ed](https://github.com/wxajs/wxa/commit/a62f6ed6a8c6f5686b917ed67acd860e08c28f08))
* **cli:** 忘了去掉注释 ([cd3b8bf](https://github.com/wxajs/wxa/commit/cd3b8bfe5ae23a864028fe30f1d3e10487906f2d))
* **cli:** 省掉 import 后续 StringLiteral 的处理 ([5beb1d3](https://github.com/wxajs/wxa/commit/5beb1d3a490bff3ae74a34cb346f01688732f423))
* **cli2:** disable babel compiler to compiler wxs file ([57d66a5](https://github.com/wxajs/wxa/commit/57d66a56c4fe3266215b1441c9cd431911f3bf73))


### Features

* **cli:** add exportDeclaration support ([2dc9928](https://github.com/wxajs/wxa/commit/2dc9928373bb70e139621327ef98a2f8d7564e99))
* **cli:** add gitee template repo, wxa2 create command now can choose repo, github, gitee or custom ([c63aa4d](https://github.com/wxajs/wxa/commit/c63aa4d287131cef4cd7e4f35eb62ff0e321c4e0))
* **cli:** add pxtorpx options in wxa.optimization.transformPxToRpx ([6760bdb](https://github.com/wxajs/wxa/commit/6760bdb1f1d06538055b55b0a9d3109938e10f1d))
* **cli:** allow stuff empty attributes ([e2998af](https://github.com/wxajs/wxa/commit/e2998af6c6b4c80715953a31af06714a9d8de687))
* **cli:** allow wxa.config.js exports a funciton or array or object ([09e12f2](https://github.com/wxajs/wxa/commit/09e12f26eb3c585ea04c8c8ff025010d8a4a2820))
* **cli:** auto compact injected wxa runtime and node_modules file ([ce2c9f1](https://github.com/wxajs/wxa/commit/ce2c9f13c404987cb90a927a7fea22c866faf013))
* **cli:** dynamic inject directive runtime dependencies ([160008e](https://github.com/wxajs/wxa/commit/160008ef2bc16e327578e0b868887fcc2b784512))
* **cli:** enhance wxa lib import ([13e4803](https://github.com/wxajs/wxa/commit/13e4803e1b13fd0ae604bad8bf4023a2772b7a1e))
* **cli:** inject wxa platform env to __WXA_PLATFORM__ variable ([61862e5](https://github.com/wxajs/wxa/commit/61862e54129eaf5612c32204da56e9e68c461e3d))
* **cli:** use json5 to support writing comment in wxa.config file ([fd87b7e](https://github.com/wxajs/wxa/commit/fd87b7e3d6c8531e34d64969443ff4ca4a27e9dc))
* **cli core:** dynamic add directive to runtime ([50b80dc](https://github.com/wxajs/wxa/commit/50b80dccd3e78a4f0b363819eacb2ff09d000085))
* wxa:mock增加银行卡模拟 ([288af33](https://github.com/wxajs/wxa/commit/288af336fe9853329a388297fd28fbd0973bcafd))
* **cli:** Sourcemap generate ([c2bc977](https://github.com/wxajs/wxa/commit/c2bc97761db54353a907bdf3fff1b592ea8a9642))
* **directive:** 开启wxa指令功能,新增wxa:mock指令 ([2a5062a](https://github.com/wxajs/wxa/commit/2a5062a8f0add912029f3dee7e069fafbd76161e))
* **wxa-cli:** 支持wxs依赖分析 ([c172b1f](https://github.com/wxajs/wxa/commit/c172b1f1106398b2e64a5040add4ff01b27412fa))


### Performance Improvements

* **cli:** add whitePropsList to auto add empty attributes ([ccfbbe8](https://github.com/wxajs/wxa/commit/ccfbbe8a153924794b0710246c32545a71971eda))


### BREAKING CHANGES

* **cli2:** babel compiler never compile wxs file, don't use es* in it.





# [2.1.0](https://github.com/wxajs/wxa/compare/v2.0.8...v2.1.0) (2019-08-28)


### Bug Fixes

* **cli:** checking if a modules is in main package should consider the npm file ([6d4a207](https://github.com/wxajs/wxa/commit/6d4a207))
* **cli:** color mark wrong, dom-walk fixed ([2fead70](https://github.com/wxajs/wxa/commit/2fead70))
* **cli:** fix DOM string output ([0927890](https://github.com/wxajs/wxa/commit/0927890))
* **cli:** fix global components ([42c31dd](https://github.com/wxajs/wxa/commit/42c31dd))
* **cli:** fix multi components split problem ([e0cc3b4](https://github.com/wxajs/wxa/commit/e0cc3b4))
* **cli:** if in wach mode, do not do dep-split ([45d8b29](https://github.com/wxajs/wxa/commit/45d8b29))
* **cli:** nowaday module's dependencies will auto mark as CHANGED state, so builder shouldn't mark a ([58dbe78](https://github.com/wxajs/wxa/commit/58dbe78))
* **cli:** transform array to map ([e3b6543](https://github.com/wxajs/wxa/commit/e3b6543))
* **cli:** use color to specify which modules is changed ([167d615](https://github.com/wxajs/wxa/commit/167d615))
* **cli:** while a module compiled fail, we also need to mark it. ([5de7216](https://github.com/wxajs/wxa/commit/5de7216))
* **cli:** wxa file import other source file should rename to target wxa filename ([524600b](https://github.com/wxajs/wxa/commit/524600b))


### Features

* **cli:** firstly resolve npm modules's entry file then other ([c73d907](https://github.com/wxajs/wxa/commit/c73d907))
* **cli:** split module into subpackage ([c5c9a69](https://github.com/wxajs/wxa/commit/c5c9a69))
* **cli:** split node_modules for subpackage ([e257237](https://github.com/wxajs/wxa/commit/e257237))
* **cli:** support outer dependencies collect ([19dfb0d](https://github.com/wxajs/wxa/commit/19dfb0d)), closes [#8](https://github.com/wxajs/wxa/issues/8)





# 2.0.0-rc.1 (2019-02-01)



# 2.0.0-rc.1 (2019-02-01)


### Bug Fixes

* **cli:** encode project name while generating project.config.json ([3e45fb7](https://github.com/wxajs/wxa/commit/3e45fb7))



# 2.0.0-rc.0 (2019-01-28)


### Bug Fixes

* **babel:** constructure should same as build ([70255b6](https://github.com/wxajs/wxa/commit/70255b6))
* **builder/schedule:** calc hash when the code is not compile ([abd300f](https://github.com/wxajs/wxa/commit/abd300f))
* **cli:** add [@babel](https://github.com/babel)/runtime ([7d9ff77](https://github.com/wxajs/wxa/commit/7d9ff77))
* **cli:** add deps ([7f8e3ef](https://github.com/wxajs/wxa/commit/7f8e3ef))
* **cli:** add support for wxa1.0 config ([ee8b6e9](https://github.com/wxajs/wxa/commit/ee8b6e9))
* **cli:** clean up terminal print out with progressTextBar ([ebe4264](https://github.com/wxajs/wxa/commit/ebe4264))
* **cli:** code string should replace in content item ([41f7c2e](https://github.com/wxajs/wxa/commit/41f7c2e))
* **cli:** deps in package.json ([9516c8c](https://github.com/wxajs/wxa/commit/9516c8c))
* **cli:** fix dynamic template path ([4f3104b](https://github.com/wxajs/wxa/commit/4f3104b))
* **cli:** fix memory leak ([0fe42a8](https://github.com/wxajs/wxa/commit/0fe42a8))
* **cli:** fix subpackages mode and third party mode ([c06e310](https://github.com/wxajs/wxa/commit/c06e310))
* **cli:** fix the compatible for window system ([2f69e9c](https://github.com/wxajs/wxa/commit/2f69e9c))
* **cli:** fix upload command ([ff84115](https://github.com/wxajs/wxa/commit/ff84115))
* **cli:** ignore dynamic path in require expression nowtime ([1342adf](https://github.com/wxajs/wxa/commit/1342adf))
* **cli:** increase code's robustness ([b010c68](https://github.com/wxajs/wxa/commit/b010c68))
* **cli:** judage kind according to mdl.meta.source instead of type. ([e5d8c4e](https://github.com/wxajs/wxa/commit/e5d8c4e))
* **cli:** mark base64 as URI resource, do not stop compiling while fail resoling deps in css ([262e667](https://github.com/wxajs/wxa/commit/262e667))
* **cli:** mark dynamic path and base64 source as uri. drop error message while process this kind of ([4482626](https://github.com/wxajs/wxa/commit/4482626))
* **cli:** must clean up code for watch mode. ([b84bc13](https://github.com/wxajs/wxa/commit/b84bc13))
* **cli:** pkg regexp fix ([c9bd9be](https://github.com/wxajs/wxa/commit/c9bd9be))
* **cli:** special handle empty template ([b8c231f](https://github.com/wxajs/wxa/commit/b8c231f))
* **cli.create:** use shelljs for helping fix window command. ([2664a60](https://github.com/wxajs/wxa/commit/2664a60))
* **compile-config:** path in window should fix up ([24b1f84](https://github.com/wxajs/wxa/commit/24b1f84))
* **compile-script:** sourceType for script should specify .wxs file ([ea7bb4e](https://github.com/wxajs/wxa/commit/ea7bb4e))
* **entry point:** refactory entry point process, fix watch mode app.json's update ([3f9481a](https://github.com/wxajs/wxa/commit/3f9481a))
* **logger.js compiler.js:** add awaitWriteFinish for win. optimize logger ([4eb237c](https://github.com/wxajs/wxa/commit/4eb237c))
* **mount/unmount page entry:** mount/unmount page entry ([0b0039e](https://github.com/wxajs/wxa/commit/0b0039e))
* **plugin-uglifyjs:** regexp wrong ([ad0125f](https://github.com/wxajs/wxa/commit/ad0125f))
* **progressbar:** window's bash cmd cannot get the process.stdout.column ([7d93f11](https://github.com/wxajs/wxa/commit/7d93f11))
* **schedule:** page should not reassign ([7e207f8](https://github.com/wxajs/wxa/commit/7e207f8))
* **schedules:** change window's '\\'->'/' ([b951b69](https://github.com/wxajs/wxa/commit/b951b69))
* **watch-wxa-plugin:** can not drop onload, unload fn and watcher. ([7b84a73](https://github.com/wxajs/wxa/commit/7b84a73))
* **wxa-cli:** rewrite ts ext to js ([d70d7ba](https://github.com/wxajs/wxa/commit/d70d7ba))
* **xmlWalker copy:** fix xml walker to find resource in xml attributes, copy file to dist ([1eff0fe](https://github.com/wxajs/wxa/commit/1eff0fe))
* “ should be placed in regexp ([ec1e362](https://github.com/wxajs/wxa/commit/ec1e362))
* add windows compat in resolved path. fixed [#1](https://github.com/wxajs/wxa/issues/1) ([24566fd](https://github.com/wxajs/wxa/commit/24566fd))
* bug ([6a399c6](https://github.com/wxajs/wxa/commit/6a399c6))
* bug fix ([e3907cf](https://github.com/wxajs/wxa/commit/e3907cf))
* change regexp for require. drop ignore check. ([fbf7610](https://github.com/wxajs/wxa/commit/fbf7610))
* clearline in window ([3460f60](https://github.com/wxajs/wxa/commit/3460f60))
* cli should ignore comment ([c5eaf52](https://github.com/wxajs/wxa/commit/c5eaf52))
* fix regexp for something.require() ([d5cc003](https://github.com/wxajs/wxa/commit/d5cc003))
* new instance ([60385f5](https://github.com/wxajs/wxa/commit/60385f5))
* npmhack ([b9c0e7a](https://github.com/wxajs/wxa/commit/b9c0e7a))
* path fix up ([06f4edc](https://github.com/wxajs/wxa/commit/06f4edc))
* require support uri ([aeb68e5](https://github.com/wxajs/wxa/commit/aeb68e5))
* specially decode express in wxml ([1f2ec33](https://github.com/wxajs/wxa/commit/1f2ec33))
* spell ([6f79de6](https://github.com/wxajs/wxa/commit/6f79de6))
* use compile-config for json compile ([3923387](https://github.com/wxajs/wxa/commit/3923387))
* when find some files changed, we should clear schedule's record ([c32d6a7](https://github.com/wxajs/wxa/commit/c32d6a7))
* 修复wxs传递的ext类型 ([d52e6e6](https://github.com/wxajs/wxa/commit/d52e6e6))
* 路径修复 ([7765943](https://github.com/wxajs/wxa/commit/7765943))


### Code Refactoring

* **cli:** change global components field from 'usingComponents' to 'wxa.globalComponents' ([4dbef1d](https://github.com/wxajs/wxa/commit/4dbef1d))


### Features

* **@wxa/cli:** generate code right after depedency resolve ([509ec66](https://github.com/wxajs/wxa/commit/509ec66))
* **@wxa/compiler-babel upgrade to 2.0:** migrate to babel7, upgrade api for [@wxa](https://github.com/wxa)/cli@2.0+ ([ac2ce6c](https://github.com/wxajs/wxa/commit/ac2ce6c))
* **babel loader:** upgrade wxa-loader-babel ([dc69225](https://github.com/wxajs/wxa/commit/dc69225))
* **babel, sass, schedule:** add cache control to babel loader, add content field to each module ([b3bdd65](https://github.com/wxajs/wxa/commit/b3bdd65))
* **builder:** change compilerLoader to loader ([074db5d](https://github.com/wxajs/wxa/commit/074db5d))
* **builder schedule:** initial watch mode ([ec16415](https://github.com/wxajs/wxa/commit/ec16415))
* **cli:** add cli support to invoke wechat development tool ([55843c4](https://github.com/wxajs/wxa/commit/55843c4))
* **cli:** add default wxa configs so that simple wxa application need any configs file ([f2138c4](https://github.com/wxajs/wxa/commit/f2138c4))
* **cli:** add no-progress and performance at schedule ([e8f1e80](https://github.com/wxajs/wxa/commit/e8f1e80))
* **cli:** add optimize and generate progress bar ([87a71c6](https://github.com/wxajs/wxa/commit/87a71c6))
* **cli:** add Promise to globalObject ([6a1887d](https://github.com/wxajs/wxa/commit/6a1887d))
* **cli:** add promise.finally pollyfill ([885abdb](https://github.com/wxajs/wxa/commit/885abdb))
* **cli:** add rebuildModule and finishRebuildModule hooks for watch mode ([588fba2](https://github.com/wxajs/wxa/commit/588fba2))
* **cli:** add verbose flag to print more infomation of compilation. ([53e1ca5](https://github.com/wxajs/wxa/commit/53e1ca5))
* **cli:** auto detect and add regeneratorRuntime, add Default babel's configs ([8294907](https://github.com/wxajs/wxa/commit/8294907))
* **cli:** clac file size for da ([be1e81d](https://github.com/wxajs/wxa/commit/be1e81d))
* **cli:** create command, clone template from github ([05374d9](https://github.com/wxajs/wxa/commit/05374d9))
* **cli:** drop watch mode from full third party mode ([18fa623](https://github.com/wxajs/wxa/commit/18fa623))
* **cli:** generate project.config.json while creating new wxa project. ([aa6fa1b](https://github.com/wxajs/wxa/commit/aa6fa1b))
* **cli:** load loader from cli's node_modules ([d4fc48d](https://github.com/wxajs/wxa/commit/d4fc48d))
* **cli:** read project name and print out ([76fa28a](https://github.com/wxajs/wxa/commit/76fa28a))
* **cli:** refactory logger, beautify output ([2b5e0ad](https://github.com/wxajs/wxa/commit/2b5e0ad))
* **cli:** scan comments to extract extral resource ([0df9e28](https://github.com/wxajs/wxa/commit/0df9e28))
* **cli:** support both subpackages and subPackages ([c1c52e8](https://github.com/wxajs/wxa/commit/c1c52e8))
* **cli:** support setting dependency Manager like cnpm, tnpm, wnpm ([9469aaf](https://github.com/wxajs/wxa/commit/9469aaf))
* **cli:** use globby to add every page entry point ([27b2900](https://github.com/wxajs/wxa/commit/27b2900))
* **compile script:** scan comment for static wxa_source_src ([0017432](https://github.com/wxajs/wxa/commit/0017432))
* **compile-config、compile-template:** nested third party components resolve ([7984a2a](https://github.com/wxajs/wxa/commit/7984a2a))
* **compiler-template.js, compiler-config.js:** add optimizeAssets hook to template compiler, drop a ([3d6e219](https://github.com/wxajs/wxa/commit/3d6e219))
* **component-resolver generator:** resolve component and generate common module ([e07860c](https://github.com/wxajs/wxa/commit/e07860c))
* **ComponentManager:** add componentManager to resolve custom component ([16ea5f8](https://github.com/wxajs/wxa/commit/16ea5f8))
* **css/xml resolver:** add import, wxs support ([9672f36](https://github.com/wxajs/wxa/commit/9672f36))
* **decorator:** migirate from legacy decorator ([fc821ad](https://github.com/wxajs/wxa/commit/fc821ad))
* **dependencies resolve:** almost complete dependencies resolve. the first phase of wxa compile ([b5060a7](https://github.com/wxajs/wxa/commit/b5060a7))
* **logger, npmManager, progressBar:** add node-notifier to notify error, add npmManager to auto ins ([80f0279](https://github.com/wxajs/wxa/commit/80f0279))
* **nodeModule hack:** add some hack for node_module ([3c57d69](https://github.com/wxajs/wxa/commit/3c57d69))
* **optimizer and generator:** use optimizer to optimize code and use generator to generate code ([259568c](https://github.com/wxajs/wxa/commit/259568c))
* **output:** output javascript module ([c4508b6](https://github.com/wxajs/wxa/commit/c4508b6))
* **replace and uglifyjs plugin:** add replace and uglifyjs plugin support ([711ac6f](https://github.com/wxajs/wxa/commit/711ac6f))
* **resolvers/component/index:** global components support ([efdc3ec](https://github.com/wxajs/wxa/commit/efdc3ec))
* **sass-loader:** sass-loader ([bacbe4c](https://github.com/wxajs/wxa/commit/bacbe4c))
* **third party mode:** support build multi project once ([dd2bb83](https://github.com/wxajs/wxa/commit/dd2bb83))
* **watch mode:** basic watch mode, ToDo: reference cleanup, dpt cleanup ([e689a03](https://github.com/wxajs/wxa/commit/e689a03))
* **watch mode for cli:** watch file in the dependencies tree. recompile, unlink or add new modules. ([4070252](https://github.com/wxajs/wxa/commit/4070252))
* **wxa lib:** add wxa lib support ([e2ceb5b](https://github.com/wxajs/wxa/commit/e2ceb5b))
* **wxa wrap:** wrap wxa launch function with compile time. ([7dad651](https://github.com/wxajs/wxa/commit/7dad651))
* **wxa-plugin-postcss:** new plugin for wxa ([17e3f8a](https://github.com/wxajs/wxa/commit/17e3f8a))
* **wxa/core:** upgrade to babel7, rewrite wxa functionn ([c4cfce5](https://github.com/wxajs/wxa/commit/c4cfce5))
* add compiler ([e9e7597](https://github.com/wxajs/wxa/commit/e9e7597))
* add logger and progress bar ([cbc97a0](https://github.com/wxajs/wxa/commit/cbc97a0))
* add schedule to manage compile task ([9f3a181](https://github.com/wxajs/wxa/commit/9f3a181))
* add template compile and cache ([753ed38](https://github.com/wxajs/wxa/commit/753ed38))
* basically finish build and watch feature ([95e93a7](https://github.com/wxajs/wxa/commit/95e93a7))
* compile component for npm ([7020f6c](https://github.com/wxajs/wxa/commit/7020f6c))
* compile npm's com ([e6585be](https://github.com/wxajs/wxa/commit/e6585be))
* make compiler plugable ([fd8a67f](https://github.com/wxajs/wxa/commit/fd8a67f))
* more comfort log ([b4a6c4d](https://github.com/wxajs/wxa/commit/b4a6c4d))
* parse component's path ([7848796](https://github.com/wxajs/wxa/commit/7848796))
* read babelrc or pkg.babel configurations ([1a9f5d7](https://github.com/wxajs/wxa/commit/1a9f5d7))
* store handled file incase of duplicated handle ([c8dd745](https://github.com/wxajs/wxa/commit/c8dd745))
* support create project ([2415bc1](https://github.com/wxajs/wxa/commit/2415bc1))
* support extension ([075acd2](https://github.com/wxajs/wxa/commit/075acd2))
* support no-cache ([91ddf6e](https://github.com/wxajs/wxa/commit/91ddf6e))
* support path alias ([345a19c](https://github.com/wxajs/wxa/commit/345a19c))
* use eventemitter to emit event ([ae61534](https://github.com/wxajs/wxa/commit/ae61534))
* use webpack/tapable for apply plugins ([7a362b2](https://github.com/wxajs/wxa/commit/7a362b2))
* wechatdevtool cli invoke ([72eef98](https://github.com/wxajs/wxa/commit/72eef98))
* 支持scope类型依赖指定文件 ([bf6decf](https://github.com/wxajs/wxa/commit/bf6decf))


### BREAKING CHANGES

* **cli:** move global components field from 'usingComponents' to 'wxa.globalComponents'
* **wxa-plugin-postcss:** optimizeAssets hook will pass opath obj instea of code, cause developer always use
compilation.code and code is never used
