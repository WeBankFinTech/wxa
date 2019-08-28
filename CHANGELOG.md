# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

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
