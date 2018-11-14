# 创建项目

运行以下命令创建一个新项目：

``` bash
wxa2 create
```

按提示在命令行中依次：

1. 输入项目名
2. 选择需要的[模板](https://github.com/Genuifx/wxa-templates)

一个新的wxa项目就创建好了。创建项目，需要在微信开发者工具中调试开发，按照下述步骤进行：

1. 打开新建的项目
2. 运行`npm i`安装依赖
3. 依赖安装完毕后，运行`wxa2 build -w`
4. 打开微信开发者工具添加小程序项目，指定文件夹到`path/to/project/dist`

即可开始小程序项目开发。

::: tip 提示
目前`create`命令本质是从github clone代码到本地，如遇到创建失败，可以手动从[模板库](https://github.com/Genuifx/wxa-templates)下载模板。
:::

::: tip 附录
目前支持的模板有：
- **Base**: 基础模板，最简洁的wxa项目模板。
- **Redux**: 引入`@wxa/redux`，需要在项目中使用redux的开发者可以选择这个。
- **Vant**: 适配`vant-weapp`（有赞UI）组件，项目中可以直接在`usingComponents`引用对应有赞组件。
- **Echarts**: 适配`Echarts for mini-program`

具体代码请查看[模板库](https://github.com/Genuifx/wxa-templates)
:::