---
sidebarDepth: 1
---

# 快速开始

使用 wxa 开发微信小程序，只需要 5 分钟！

1. 申请小程序账号
2. 安装 `@wxa/cli2` 
3. 新建项目
4. 开始开发小程序

## 申请账号

申请小程序账号只需要在微信[官方网站](https://mp.weixin.qq.com/)操作即可：立即注册 -> 小程序注册，填入邮箱，密码即可。申请完毕之后，在登录进入小程序仪表盘界面，依次点击开发->开发设置，找到 **`APPID`**。

::: tip 提示
小程序的调试和上传代码离不开微信开发者工具，需要在[官方网站](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html)下载对应系统的开发工具

:::

## 新建项目

确保 `node` 版本大于 **8.15.0** 的情况下，直接运行以下命令安装命令行工具：

``` bash
npm i -g @wxa/cli2@next
```

安装完毕后，运行 `wxa2 create` 开始创建项目，按照提示填写项目模板、名称、appid 完成新建工程。

:warning: 需要注意的是：种子工程在 [`github`](https://github.com/wxajs/wxa-templates) 中维护，如果本机环境无法直接访问到 github， 可以手动在 github 下载后使用。

![](./create.jpg)

等待片刻后，即完成了工程的初始化。

进入项目目录后，安装项目依赖，并且开始编译：

```bash
npm i && wxa2 build
```

等待片刻后，就可以开始小程序开发了！:sunglasses:

::: tip 一键预览/上传代码

在进行了一段时间小程序开发之后，我们往往需要在真机上面进行调试，这个时候可以使用 `wxa` 命令行调用微信开发者工具，实现一键预览、上传代码的效果。

window用户需要在 `wxa.config.js`中配置 `wechatwebdevtools` 选项，填入安装微信开发者工具的目录即可，mac用户如果是默认安装，则无需额外配置。

一键预览：`wxa2 cli -a preview`

一键上传代码： `wxa2 cli -a upload`

:::
