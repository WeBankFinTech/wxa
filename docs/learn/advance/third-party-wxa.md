# 三方开发

三方小程序和普通的小程序本质上没有不同，但三方开发面临的复杂度相对较高，且开发过程中却存在着很多额外的痛点。

- **开发难度**

一个三方小程序往往不会只提供给单独的第三方，相反我们希望逻辑代码能够复用到其他的合作方小程序中，与此同时，界面 UI 我们允许有限度的修改。

更高级点，可能每个合作方需要定制自己的一些页面，这个时候我们还需要为特定合作方开发特定页面，并且控制页面入口。

上述需求在三方开发中非常常见，我们需要兼顾**代码可复用**，**小程序打包体积**，**UI 换肤**等等。而这些在原生开发中是不可能完美做到的，原生的小程序只有一个运行时的途径区分不同三方小程序（即 `ext.json` 和 `wx.getExtConfigSync`）

因此我们开发三方小程序的时候往往需要单独的去写脚本替换文件，指定打包到不同目录等等。但是在面临一些优化问题的时候，简单的脚本就显得无能为力了，譬如不同的合作方都要求有自己的一些活动页面，我们并不希望 A 的活动页面打包到 B 的代码中，我们希望不同合作方能按“需”打包，而按“需”这件事情如果通过脚本来做的话，我们得专门给每个合作方编写特定脚本，繁琐且不易维护。

- **分发和部署难度**

当三方小程序需要更新的时候，我们需要一个一个合作方的输出小程序代码，然后使用开发者工具一个个小程序的上传代码，预览小程序，提交体验版。当接入方少的时候，手动的重新这些过程还能接受，但是如果有10个、20个合作方，这么做就很不人道了。

故 wxa2.x 专门为三方开发设计了一些套路解决上述痛点。

## 开发

代码复用的问题。既然在三方开发中，大部分页面都可以复用，那么我们只需要一次性多次编译、输出到不用的文件夹就可以了。

在 `wxa.config.js` 中指定 `thirdParty` 配置项：

```js
module.exports = [
    {
        name: 'partner-A',
        output: {
            path: path.resolve(__dirname, 'partners/A'),
        },
    }
]
```

可以看到，我们在 `thirdParty/wxaConfigs` 中指定了不同的项目名和输出路径，这样一来，我们就可以为每个不同的合作方输出单独的小程序代码了。

但是这样子不够，不同合作方的项目参数都不一样，而且生产和测试的参数也不一致，譬如远程服务器地址，是否允许打印特定的错误信息等等。我们需要在运行时能区分当前是哪个合作方的小程序处于哪个环境。此时可以使用 `@wxa/plugin-replace` 实现效果：

```js
module.exports = [
    {
        name: 'partner-A',
        output: {
            path: path.resolve(__dirname, 'partners/A'),
        },
        plugins: [
            new ReplacePlugin({
                list: require('./projects/A/app.config.js').env,
            }),
        ]
    }
]
```

插件文档请查看：[`@wxa/plugin-replace`](https://wxajs.github.io/wxa/plugin/cli/replace.html)。通过为不同合作方使用不同的插件，我们可以给不同的合作方替换不同的参数，指定是否需要压缩代码，是否需要使用PostCss等。

这样子一来，我们就可以为不同合作方输出不同小程序代码了，接下来我们需要解决 **UI 换肤**和 **打包体积**两个问题。这两个问题也可以理解为三方小程序**个性化**问题。怎么为不同合作方个性化呢？

首先是样式方面，小程序 `app.wxss` 定义的样式属于全局样式，所有页面都生效。既然如此我们可以为不同的合作方替换指定的 `app.wxss`，再配合[CSS-VAR](https://developer.mozilla.org/zh-CN/docs/Web/CSS/var)，就可以实现 UI 换肤功能了。

其次是打包体积，不同合作方定制的页面我们并不想全部输出。只要输出到指定合作方代码即可。幸运的是，开发的依赖分析功能可以根据 `app.json` 指定的 `pages` 和 `subPackage` 打包相应的页面以及依赖。

也就是说我们只需要为不同合作方替换不同的 `app.json` 即可解决打包体积的问题。

改动 `wxa.config.js` 配置如下：

```js
module.exports = [
    {
        name: 'partner-A',
        point: {
            'app.json': path.resolve('projects/A/app.json'),
            'ext.json': path.resolve('projects/A/ext.json'),
            'app.scss': path.resolve('projects/A/app.scss'),
        },
        output: {
            path: path.resolve(__dirname, 'partners/A'),
        },
        plugins: [
            new ReplacePlugin({
                list: require('./projects/A/app.config.js').env,
            }),
        ]
    },
    {
        name: 'partner-B',
        point: {
            'app.json': path.resolve('projects/B/app.json'),
            'ext.json': path.resolve('projects/B/ext.json'),
            'app.scss': path.resolve('projects/B/app.scss'),
        },
        output: {
            path: path.resolve(__dirname, 'partners/B'),
        },
        plugins: [
            new ReplacePlugin({
                list: require('./projects/B/app.config.js').env,
            }),
        ]
    }
]
```

至此，我们为不同合作方指定替换了入口文件 `app.scss` 、 `ext.json` 和 `app.json`。为不同合作方维护不同的 UI 皮肤，指定打包编译的 pages，输出特性的定制页面。

我们通过下面的命令开始一次性的输出所有合作方配置：

```bash
wxa2 build --project *
# 或者使用缩写
wxa2 build -p *
```

开发阶段可以指定启动监听模式单独编译某个合作方

```bash
wxa2 build --watch --project projectName
# 使用缩写
wxa2 build -p projectName
```

## 部署

在完成三方开发之后，我们需要批量的部署三方小程序。部署方面主要是利用[小程序CLI调用](https://developers.weixin.qq.com/miniprogram/dev/devtools/cli.html)，搭配批量上传代码能力完成。

首先在 `wxa.config.js` 配置好微信开发者工具的安装路径 `wechatwebdevtools`

```js
module.exports = {
    wechatwebdevtools: '/Applications/wechatwebdevtools.app'
}
```

然后再运行下面的命令即可完成批量上传。

```bash
# 指定上传特定项目
wxa2 cli --action upload --project projectName
```

需要注意的是，**由于微信开发者工具依赖 `project.config.json` 进行小程序项目管理**，而现阶段该配置文件只能由微信开发者工具生成，故在进行 CLI 调用之前，需要提前用开发者工具生成该配置文件。

上传完项目代码，之后只需要调用[微信三方平台接口](https://open.weixin.qq.com/cgi-bin/showdocument?action=dir_list&t=resource/res_list&verify=1&id=open1489144594_DhNoV&token=&lang=zh_CN)，批量提审，发布了。

:::tip 提示
我们可以在 `ext.json` 中配置 `directCommit` 为 `true`，这样子上传的三方小程序代码会直接上传到体验版。
:::
