# 构建项目

``` bash
  用法: build [options]

  编译项目

  选项:

    -w, --watch              监听文件改动
    -N, --no-cache           不使用缓存
    -m, --multi              三方开发模式，一次编译出多个项目
    -p, --project <project>  三方开发模式，单独指定需要编译监听的项目
    -h, --help               output usage information
```
## 标准构建
标准构建下，wxa会对`entry`（默认是`src/app.*`）进行依赖分析，并形成一颗依赖树，再经过代码优化步骤后，输出到指定文件夹下。

运行下面命令开始标准构建：

```bash
wxa2 build
```

如果需要区分环境的话，可以通过`cross-env`实现：

``` bash
# 生产构建
cross-env NODE_ENV=production wxa2 build --no-cache
```

::: tip 提示
只要符合默认的项目结构，一个小程序项目可以不需要任何配置即可进行标准构建
:::

## 监听模式
开发过程中，对于文件修改、增删等操作，自动进行重新编译是很实用的功能。`wxa`使用`chokidar`对于依赖树上的节点进行监听，自动重新编译代码并更新依赖树。
```bash
wxa2 build --watch
#或者
wxa2 build -w
```

## 三方模式
三方开发模式，需要先配置好`wxa.config.js`的`thirdParty`项。指定多个三方小程序的需要替换的入口文件，wxa配置，插件，以及输出目录等。

``` js
// wxa.config.js

module.exports = {
    // 指定入口
    entry: ['./src/app*', './src/ext.json'],
    thirdParty: [
        // 每配置一个对象意味着多输出一个三方小程序
        {
            // wxaConfigs配置项将和项目通用配置做一次merge
            wxaConfigs: {
                // 输出dist-A文件夹下
                output: {
                    path: path.resolve(__dirname, 'dist-A'),
                },
                // 环境变量替换
                plugins: [
                    new ReplacePlugin({
                        list: {
                            'WXA_ENV': 'HEY A',
                        },
                    }),
                ],
            },
            // 需要替换的文件，理论上所有entry文件都可以被替换。
            point: {
                'ext.json': path.resolve(__dirname, 'projects/A/ext.json'),
                'app.wxa': path.resolve(__dirname, 'projects/A/app.wxa'),
            },
            // 别名，用于区分不同三方小程序
            name: 'PartnerA',
        },
        {
            wxaConfigs: {
                output: {
                    path: path.resolve(__dirname, 'B'),
                },
                plugins: [
                    new ReplacePlugin({
                        list: {
                            'WXA_ENV': 'HEY B',
                        },
                    }),
                ],
            },
            point: {
                'ext.json': path.resolve(__dirname, 'projects/B/ext.json'),
                'app.wxa': path.resolve(__dirname, 'projects/B/app.wxa'),
            },
            name: 'PartnerB',
        },
    ],
}
```

配置完毕后，运行三方构建命令即可输出多个三方小程序。

``` bash
# 一次性构建多个三方小程序
wxa2 build -m
# 或者
wxa2 build --multi
```

开发过程中，可以搭配监听模式和三方模式一起使用。

``` bash
# 监听项目，同时持续更新PartnerA和PartnerB代码文件。
wxa2 build -w -m -p PartnerA,PartnerB
# 完整的命令为:
wxa2 build --watch --multi --project=PartnerA,PartnerB
```
