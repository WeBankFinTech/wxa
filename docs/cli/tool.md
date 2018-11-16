# 调用微信开发者工具

## 项目配置文件
开发者工具在解析、编译项目依赖于[`project.config.json`](https://developers.weixin.qq.com/miniprogram/dev/devtools/projectconfig.html)，默认情况下，一个小程序项目不需要开发者手动修改该文件，在开发者工具界面设置完毕后会自动生成一份最新的配置文件。

::: tip 提示
:pushpin: 所有通过cli调用微信开发者工具的操作都依赖该配置文件，且配置格式不能错误，否则调用将直接失败。

:memo: wxa后续会考虑加入project.config.json的维护功能。
:::

## 登录
在命令行中打印登录二维码。后续预览、上传操作需要提前登录。

``` bash
wxa2 cli -a login
```

## 预览
上传代码到开发版，并在命令行中打印预览二维码。

``` bash
wxa2 cli -a preview
```

## 上传代码
上传代码到`mp`后台，:warning:小程序测试号无法上传代码。

``` bash
# 上传默认项目
wxa2 cli -a upload
# 一次性上传多个三方项目
wxa2 cli -a upload -m
```

::: tip ext.json
三方开发的时候，在`ext.json`中配置`directCommit: true`，可以直接上传代码到体验版
:::

::: warning 警告
一次性上传多个三方项目的时候，要求每个三方项目都有一个项目配置文件，即`project.config.json`。
:::