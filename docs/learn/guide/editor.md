# 语法高亮和检查

## 编辑器配置
::: tip 提示
推荐使用[VSCode](https://github.com/Microsoft/vscode)开发小程序，提高开发体验和效率:100:
::: 

### VSCode 配置
使用 [wxa](https://marketplace.visualstudio.com/items?itemName=genuifx.wxa) 插件实现 `.wxa` 文件语法高亮~

1. 在应用商店搜索 wxa 并安装。
2. `MacOS: command + shift + p` 或 `Windows: ctrl + shift + p`，设置 `.wxa` 文件关联语言模式 `wxa`即可。

打开项目的`.vsode/settings.json`，添加以下配置：

```json
{
    "javascript.implicitProjectConfig.experimentalDecorators": true,
    "eslint.enable": true
}
```

::: tip 提示
wxa 拓展是从 [vetur](https://github.com/vuejs/vetur) fork 而来，专门对小程序语法和 `wxa` 文件做了修改。
:::

### WebStorm 配置

1. 打开WebStorm偏好设置 `Windows and Linux: File -> Settings `或`macOS: WebStorm -> Preferences`
2. 点击 File Types `Editor -> File Types`，找到 `Vue.js Template`，在`registered Patterns`中添加`*.wxa`

## Eslint代码校验
使用eslint校验代码，在开发阶段就解决弱*问题
```json
{
    "extends": [
        "google"
    ],
    "root": true,
    "env": {
        "commonjs": true,
        "es6": true,
        "node": true
    },
    "parser": "vue-eslint-parser",
    "parserOptions": {
        "parser": "babel-eslint",
        "ecmaFeatures": {
            "experimentalObjectRestSpread": true
        },
        "ecmaVersion": 2017,
        "sourceType": "module"
    },
    "rules": {
        "vue/valid-template-root": "off",
        "no-const-assign": "warn",
        "valid-template-root": "off",
        "no-this-before-super": "warn",
        "no-undef": "warn",
        "no-unreachable": "warn",
        "no-unused-vars": "warn",
        "constructor-super": "warn",
        "valid-typeof": "warn",
        "one-var": "warn",
        "max-len": "off",
        "no-trailing-spaces": "off",
        "require-jsdoc": "warn",
        "camelcase": "warn",
        "no-invalid-this": "warn",
        "new-cap": "warn",
        "guard-for-in": "warn"
    }
}
```
::: warning 注意
"parser"指定为"vue-eslint-parser"，能够解析到`.wxa`文件的结构，否则会出现奇奇怪怪的报错。
:::
