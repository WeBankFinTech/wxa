# wxa-cli
[![NPM version](https://img.shields.io/npm/v/@wxa/cli.svg)](https://www.npmjs.com/package/@wxa/cli)

:smiley:cli for wechat miniprogram developing.

detail docuemnts: [@wxa/doc](https://genuifx.github.io/wxa-doc/#/lang/english/):100:

更完善的文档：[@wxa/doc](https://genuifx.github.io/wxa-doc/#/home):100:

![mind-node](./Wxa.png)

# Feature
- [x] Npm resolve
- [x] Native mini program pattern
- [x] Vue pattern
- [x] Mult Plugins
- [x] Custom compiler
- [x] Native mini program component
- [x] Component Npm resolve
- [x] Wechatwebdevtools control

# Installing
use `npm` for installing wxa.
`npm i -g @wxa/cli`

# Usage
1. basic build
`wxa build`

2. watch mode
`wxa build --watch`

3. build without cache and more detail log
`wxa build --no-cache --verbose`

4. create new project with template, see [template](#Template)
`wxa create base projectname`

5. invoke wechatdevtools, windows need setup `wechatwebdevtools` in `wxa.config.js`
- `wxa cli open`: open dev tools
- `wxa cli preview`: preview project
- `wxa cli upload -m 'upload msg' --ver 'verion'`: upload project
- `wxa cli login`: login tool, preview and upload command need login your wechat account

# Configurations

core configs file is `wxa.config.js`, mostly like below:

```javascript
const path = require('path');
const UglifyjsPlugin = require('@wxa/plugin-uglifyjs');
const ReplacePlugin = require('@wxa/plugin-replace');
let prod = process.env.NODE_ENV === 'production';
const envlist = []; // your env configurations

module.exports = {
    wechatwebdevtools: '/Applications/wechatwebdevtools.app', // path to your wechat dev tool
    resolve: {
        alias: {
            '@': path.join(__dirname, 'src'),
        },
    },
    use: ['babel', 'sass', 'stylus'],
    compilers: {
        sass: {
            // compiler options
        },
    },
    plugins: [
        new ReplacePlugin({
            list: envlist,
        }),
    ],
};

if (prod) {
    module.exports.plugins.push(new UglifyjsPlugin());
}

```

# Editor
use [vsCode](https://github.com/Microsoft/vscode) to make coding more enjoyable.
use [vetur](https://github.com/vuejs/vetur) for beautify `.wxa` file.
following vscode's configurations is recommended:
```json
{
    "javascript.implicitProjectConfig.experimentalDecorators": true,
    "vetur.grammar.customBlocks": {
    "config": "json"
  },
  "vetur.validation.template": false,
  "eslint.enable": true
}
```
and also a list of eslint configs:
```json
{
    "extends": [
        "./node_modules/eslint-config-google/index.js"
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

# Template
1. [Base Template](https://github.com/Genuifx/wxa-template-base)

# Component
wxa can resolve component in npm folder. you can easily import com from npm.
```js
// in your page's config.json
{
    "usingComponents": {
        "counting": "@wxa/ui/src/components/counting"
    }
}
```
output mostly like this:
```js
{
    "usingComponents": {
        "counting": "./../npm/@wxa/ui/src/components/counting"
    }
}
```
and [wxa-ui](https://github.com/Genuifx/wxa-ui) is coming soon.
