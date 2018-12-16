
# 从 wxa1.x 迁移

从 wxa1.x 升级到 wxa2.x 需要按以下步骤：
1. 升级依赖
2. 修改配置
3. 升级 API

在开始升级之前，首先安装好 `@wxa/cli2` 和 `babel-upgrade`。

```bash
npm i -g @wxa/cli2@next babel-upgrade
```

:::warning 注意
由于目前 2.x 还在beta阶段，安装 `@wxa` 的依赖请指定 tag 为 next，例如 `@wxa/cli2@next`，`@wxa/core@next`。
:::

## 升级依赖

需要升级 `@wxa` 相关的依赖有：
- `@wxa/core`
- `@wxa/compiler-babel`
- `@wxa/compiler-sass`
- `@wxa/compiler-stylus`
- `@wxa/plugin-replace`
- `@wxa/plugin-uglifyjs`

可以使用下面命令完成安装:

```bash
# 安装core包
npm i -S @wxa/core@next

# 安装编译包，可以选择是否使用相应插件
npm i -D @wxa/compiler-babel@next @wxa/compiler-sass@next @wxa/plugin-replace@next @wxa/plugin-uglifyjs@next

# 可选是否使用 stylus
npm i -D @wxa/compiler-stylus@next
```

由于 wxa2.x 版本全面转到 babel7 ，同 babel6 相比，毫无疑问 babel7 是一个巨大飞跃的版本，故我们需要升级所有 babel 相关依赖，幸运的是 `babel-upgrade` 可以自动找出所有需要修改的地方，并修改。

```bash
# 查询需要修改的依赖
babel-upgrade

# 查询并修改所有依赖
babel-upgrade -w
```

通过 `babel-upgrade -w` 我们一键修改了所有babel相关的配置，然后只要重新安装一遍依赖就好了：

```bash
npm i
```

:::warning 注意
值得一提的是 1.x 的 wxa cli 工具支持到 node6，而 2.x 版本只支持 node8+ 的版本，所以如果 node 版本过低的话，需要重新安装 node。安装完 node 之后，依赖需要重新 rebuild

```bash
# 重新构建C++模块
npm rebuild
```
:::

## 修改配置

如果在 wxa1.x 中没有使用到 `compiler` 配置项，该步骤可以省略，否则需要修改相关compiler的配置。

修改 1.x 的 `wxa.config.js`
```js
// ...
    // 使用到的compiler
    use: ['babel', 'sass'],
    // compiler的配置，如果需要单独配置compiler，写在这里
-    compilers: {
-        // 下面的babel配置也可以写到.babelrc中
-       babel: {
-            "sourceMap": false,
-            "presets": ["env"],
-            "plugins": [
-                "transform-class-properties",
-                "transform-decorators-legacy",
-                "transform-object-rest-spread",
-                "transform-export-extensions"
-            ],
-            "ignore": "node_modules"
-        }
-    },
// ...
```

改为： 
```js
// ...
    use: [
        {
            test: /\.js$|\.wxs$/,
            name: 'babel',
            options: {
                "sourceMap": false,
                "presets": ["@babel/preset-env"],
                "plugins": [
                    ["@babel/plugin-transform-runtime", {"version": "7.2.0"}],
                    ["@babel/plugin-proposal-decorators", {"decoratorsBeforeExport": true}],
                    ["@babel/plugin-proposal-class-properties"]
                ],
                "ignore": [
                    "node_modules"
                ]
            }
        }, {
            test: /\.sass$|\.scss$/,
            name: 'sass',
        }
    ],
// ...
```

或者将相关配置放到单独的文件，譬如 babel 的配置放到项目根目录的 `.babelrc` 或者 `babel.config.js`。

:::tip 提示
为了使代码体积能够最小化，从 2.x 开始，wxa使用 `@babel/plugin-transform-runtime` 和 `@babel/runtime` 来删除多余 helper 文件、支持 Async/Await 等语法。
此外，由于 wxa 大量应用 Decorator，而 Decorator 的提案还在第2阶段，我们需要手动指定 runtime 版本（可以在 node_modules/@babel/runtime/package.json 找到），才可以删除多余的 decorate helper函数，譬如上面的 `7.2.0`。

相关[proposal](https://github.com/tc39/proposal-decorators)，相关[ISSUE](https://github.com/babel/babel/issues/8766)。
:::

## 升级 API

2.x 中为了方便区分业务 API 和框架API，将所有内置函数都加了 `$` 前缀，如下：

- `this.app` -> `this.$app`
- `this.storage` -> `this.$storage`
- `this.router` -> `this.$router`
- `this.eventbus` -> `this.$eventbus`
- `this.fetch` -> `this.$fetch`
- `this.utils` -> `this.$utils`
- `this.wxapi` -> `this.$wxapi`

至此，2.x 升级完毕，enjoy it! :yum: