# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [2.2.0](https://github.com/wxajs/wxa/compare/v2.1.14...v2.2.0) (2020-07-06)


### Bug Fixes

* fix test suite ([0a2bf3f](https://github.com/wxajs/wxa/commit/0a2bf3f184d528b81251e35671fb8cf2e8d04694))
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
* **copy-plugin:** replace ncp with fs-extra to fix the silent error in macos ([843a00e](https://github.com/wxajs/wxa/commit/843a00e989d88b3e839d176562c2c91ead14ff35))
* **core:** fix tarbar errmsg regepx ([284537d](https://github.com/wxajs/wxa/commit/284537d57b2c80bc556b6d36b826ba7c8408a4fe))
* **validate:** add regenerator-runtime to validate ([c4680f9](https://github.com/wxajs/wxa/commit/c4680f927059251e559301836c2521b0b07ebfcc))
* **validate:** auto clear errorMsg ([1792e87](https://github.com/wxajs/wxa/commit/1792e87723ceb8aac3aeb2671ca87eadee83bfaa))
* **validate:** import regenerator-runtime ([ce1f771](https://github.com/wxajs/wxa/commit/ce1f771b10189e57aa406e1aae44562d0113048d))


### Features

* **@wxa/redux:** add data field size detect, filter ([d9d49f0](https://github.com/wxajs/wxa/commit/d9d49f0ac345129e6429abb8727f68a56472964e))
* **@wxa/redux:** support reducer registry for lazy load model in subpackage ([c10bbe5](https://github.com/wxajs/wxa/commit/c10bbe557bba8f124f72307e8572b0a7bfb72cb4))
* **cli:** add exportDeclaration support ([2dc9928](https://github.com/wxajs/wxa/commit/2dc9928373bb70e139621327ef98a2f8d7564e99))
* **cli:** add gitee template repo, wxa2 create command now can choose repo, github, gitee or custom ([c63aa4d](https://github.com/wxajs/wxa/commit/c63aa4d287131cef4cd7e4f35eb62ff0e321c4e0))
* **cli:** add pxtorpx options in wxa.optimization.transformPxToRpx ([6760bdb](https://github.com/wxajs/wxa/commit/6760bdb1f1d06538055b55b0a9d3109938e10f1d))
* **cli:** allow stuff empty attributes ([e2998af](https://github.com/wxajs/wxa/commit/e2998af6c6b4c80715953a31af06714a9d8de687))
* **cli:** allow wxa.config.js exports a funciton or array or object ([09e12f2](https://github.com/wxajs/wxa/commit/09e12f26eb3c585ea04c8c8ff025010d8a4a2820))
* **cli:** auto compact injected wxa runtime and node_modules file ([ce2c9f1](https://github.com/wxajs/wxa/commit/ce2c9f13c404987cb90a927a7fea22c866faf013))
* **cli:** dynamic inject directive runtime dependencies ([160008e](https://github.com/wxajs/wxa/commit/160008ef2bc16e327578e0b868887fcc2b784512))
* **cli:** enhance wxa lib import ([13e4803](https://github.com/wxajs/wxa/commit/13e4803e1b13fd0ae604bad8bf4023a2772b7a1e))
* **cli:** inject wxa platform env to __WXA_PLATFORM__ variable ([61862e5](https://github.com/wxajs/wxa/commit/61862e54129eaf5612c32204da56e9e68c461e3d))
* **cli:** Sourcemap generate ([c2bc977](https://github.com/wxajs/wxa/commit/c2bc97761db54353a907bdf3fff1b592ea8a9642))
* **cli:** use json5 to support writing comment in wxa.config file ([fd87b7e](https://github.com/wxajs/wxa/commit/fd87b7e3d6c8531e34d64969443ff4ca4a27e9dc))
* **cli core:** dynamic add directive to runtime ([50b80dc](https://github.com/wxajs/wxa/commit/50b80dccd3e78a4f0b363819eacb2ff09d000085))
* **compiler-babel:** Sourcemap generate ([5074b5e](https://github.com/wxajs/wxa/commit/5074b5ee4481dc7dc336eda1cf863343eb0980c9))
* **compiler-sass:** Sourcemap generating ([8ac1420](https://github.com/wxajs/wxa/commit/8ac14202daeda61508784be15ea79fd880b10d6a))
* **core:** Add sessionStorage and coopreate decorator ([5cf9961](https://github.com/wxajs/wxa/commit/5cf9961bbe2a08ff8407b2fc544ec50038760cf4))
* **core:** add wxa.platform, indicate which platform app running at ([fd9214e](https://github.com/wxajs/wxa/commit/fd9214ec6dd34dd47d085b417057b50a82d5dfad))
* **core:** auto switch while using redirectTo/navigateTo with tabbar page ([fe35479](https://github.com/wxajs/wxa/commit/fe354799b0f3e03d18d0e330b933332a722ab057))
* **core:** enabled abort request with fetch methods ([f7665ab](https://github.com/wxajs/wxa/commit/f7665ab7885d373d2aebe31e58a4314101dc471b))
* **core:** eventbus support once and scope ([0af5ac6](https://github.com/wxajs/wxa/commit/0af5ac6b2356548e765b8b700ca79eb18d0c1889))
* **core:** export Eventbus class ([b48739f](https://github.com/wxajs/wxa/commit/b48739fc4afd63f9c9bdb1f8d2a4acc3c3903c33))
* **core:** export util function ([bc51b2f](https://github.com/wxajs/wxa/commit/bc51b2f6efef0c6bc3e324667ac63d4aedb2b903))
* **core:** support pass alter options to router methods ([d3aa925](https://github.com/wxajs/wxa/commit/d3aa9255e30a15b98e1242436a0099da585896d1))
* **directive:** 开启wxa指令功能,新增wxa:mock指令 ([2a5062a](https://github.com/wxajs/wxa/commit/2a5062a8f0add912029f3dee7e069fafbd76161e))
* **directive:** 开启wxa指令功能,新增wxa:mock指令 ([f3114ab](https://github.com/wxajs/wxa/commit/f3114ab8a0ca860f465386150f40358b7f928fcf))
* **redux:** add wechat storage methods ([4f97273](https://github.com/wxajs/wxa/commit/4f97273a51d0004786e82642388843b57821eaf3))
* **redux:** deep clone the diff data to avoid effect referrence data ([3ff98ac](https://github.com/wxajs/wxa/commit/3ff98ac1526f6bef68f7598532f0f065f7fe138c))
* **validate:** enable sub component input validate ([72999b6](https://github.com/wxajs/wxa/commit/72999b6c10b28a47830efd6bf81b24cace8bddbf))
* wxa:mock增加银行卡模拟 ([288af33](https://github.com/wxajs/wxa/commit/288af336fe9853329a388297fd28fbd0973bcafd))
* **redux:** offer a method to get store instance ([8f7a71f](https://github.com/wxajs/wxa/commit/8f7a71f7188442102f96fcd9b25c8b12aa8dd242))
* wxa:mock增加银行卡模拟 ([6faca00](https://github.com/wxajs/wxa/commit/6faca00f951840da981b929a0e01a9d1f6f15590))
* **redux:** support applied middlewares, add debug mode ([f85d7f6](https://github.com/wxajs/wxa/commit/f85d7f65ed80ea3c889e7b85accf6ff8a6678047))
* **wxa-cli:** 支持wxs依赖分析 ([c172b1f](https://github.com/wxajs/wxa/commit/c172b1f1106398b2e64a5040add4ff01b27412fa))


### Performance Improvements

* **cli:** add whitePropsList to auto add empty attributes ([ccfbbe8](https://github.com/wxajs/wxa/commit/ccfbbe8a153924794b0710246c32545a71971eda))
* **core:** optimize diff algorithme to adopt complex production mode data ([16b6293](https://github.com/wxajs/wxa/commit/16b62931b18d3a04240a18e32778b8965556041d))


### BREAKING CHANGES

* **cli2:** babel compiler never compile wxs file, don't use es* in it.
* **redux:** middlewares not can be handled by user.





# [2.1.0](https://github.com/wxajs/wxa/compare/v2.0.8...v2.1.0) (2019-08-28)


### Bug Fixes

* **cli:** checking if a modules is in main package should consider the npm file ([6d4a207](https://github.com/wxajs/wxa/commit/6d4a207))
* **cli:** color mark wrong, dom-walk fixed ([2fead70](https://github.com/wxajs/wxa/commit/2fead70))
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
* **redux:** bind mapState to context ([43143cf](https://github.com/wxajs/wxa/commit/43143cf))
* **sass-loader:** support outer deps ([7d3e966](https://github.com/wxajs/wxa/commit/7d3e966)), closes [#8](https://github.com/wxajs/wxa/issues/8)
