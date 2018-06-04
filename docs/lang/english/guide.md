---
nav: english
search: english
sidebar: true
---

WXA is a complete set of WeChat mini programs solutions.  It enhances mini programs capabilities through Decorator, based on nodejs engineering mini programs development process, supports Vue single file development mode and native mini programs development mode! It also provides a set of UI components based on wxa development.

## Feature
- Vue pattern
- Native pattern
- Npm
- ES next
- UI components
- Redux

## Intention
Since the birth of the mini programs, everyone has their own opinions on improving their development process, such as componentization [zanui](https://github.com/youzan/zanui-weapp)，[weui](https://github.com/Tencent/weui-wxss/), library like[wepy](https://github.com/Tencent/wepy)。
In the past year, we have been watching the `wepy`. Reading the documentation and the source code. We have to say that the idea is really amazing. We want to apply it to the project several times, but We are also scared by a large number of issues. When wepy is stable, the result The official also supports custom components, so i have been using my own development and deployment for a year. i do found some improvements. Wxa wrote to add some of my own ideas and improve the development workflow.

## Quickstart
Wxa provides a handy `cli` tool. Using cli can quickly pull the scaffold from github and start small program development quickly.

#### Dependencies
1. check nodejs（node6+）    
2. `npm i -g @wxa/cli` 

#### scaffold
1. `wxa create base helloWorld`
2. `cd helloWorld`
3. `npm i`

#### build your project
1. `wxa build --watch`

#### open with wechat dev tools
Fill in the mini program's appid in the WeChat developer tool and point the directory to `path/to/helloWorld/dist`. Then you can start wxa project development!