* 支持事件
	* bindtap、bindlongpress、bindchange、input、touchstart、touchmove、touchend
* 目前无法支持：
    * catchtap、catchlongpress等阻止冒泡事件（自动化element.tap、element.longpress等方法无法阻止冒泡）
	* 主动操作返回（因无法监听返回事件，所以录制过程中 *点击物理返回键*、*小程序titlebar返回键*、*ios手势返回*等返回操作，暂无法支持）
    * 小程序原生的showModal、showActionSheet上的点击操作，无法录制&回放


2019年8月22日

# 开发文档
* wxa下增加.vscode/launch.json文件
```
{
    "configurations": [
        {
            "type": "node",
            "request": "launch",
            "name": "启动程序",
            "skipFiles": [
                "<node_internals>/**"
            ],
            "args": ["test", "--e2e"],
            "program": "${workspaceFolder}/packages/wxa-cli/bin/wxa.js",
            "cwd": "填入你任意小程序dist目录-绝对路径",
            "env": {
                "NODE_ENV": "可选，一般为dev或build，根据你的项目写"
            },
            "runtimeExecutable": "可选，node位置，我的是/usr/local/opt/nvm/versions/node/v12.13.1/bin/node"
        }
    ]
}
```
* wxa目录下执行 `npx lerna bootstrap`
* pacakages/wxa-core，执行`npm run dev`,`yarn link`
* 小程序目录执行`yarn link @wxa/core`
* pacakages/wxa-cli，执行`npm run dev`
* vscode启动程序，开始调试开发

# 使用手册

### 测试脚本录制
* 项目目录下执行`wxa test --e2e`，开始脚本录制，录制完成后脚本会保存在`__wxa_e2e_test__`目录下

### 测试脚本回放
* `npm i -g jest`
* 项目下执行 `npm i miniprogram-automator`
* 开发者工具修改调试基础库 2.7.3以上（src/project.config.json需同步修改libVersion）
* 项目根目录下添加文件`babel.config.js`
```
const path = require('path');
const existsSync = require('fs').existsSync;
const cwd = process.cwd();
const babelRuntime = path.join(cwd, 'node_modules', '@babel/runtime/package.json');
let hasRuntime = existsSync(babelRuntime);

const commonConfigs = {
    'plugins': [
        ['@babel/plugin-proposal-decorators', {'decoratorsBeforeExport': true}],
        ['@babel/plugin-proposal-class-properties'],
    ],
    'presets': ['@babel/preset-env'],

}
if (hasRuntime) {
    const pkg = require(babelRuntime);

    commonConfigs.plugins.unshift(['@babel/plugin-transform-runtime', {'version': pkg.version || '7.2.0'}]);
}

module.exports = {
    overrides: [{
        exclude: [/node_modules/,  /wxa-cli/],
        ...commonConfigs
    }
    ,{
        test: /wxa-e2eTest/,
        ...commonConfigs
    }]
}
```
* 项目根目录下执行`jest __wxa_e2e_test__`
