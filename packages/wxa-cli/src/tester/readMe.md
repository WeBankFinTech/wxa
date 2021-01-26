* 支持事件
	* bindtap、bindlongpress、bindchange、input、touchstart、touchmove、touchend
* 目前无法支持：
    * catchtap、catchlongpress等阻止冒泡事件（自动化element.tap、element.longpress等方法无法阻止冒泡）
	* 主动操作返回（因无法监听返回事件，所以录制过程中 *点击物理返回键*、*小程序titlebar返回键*、*ios手势返回*等返回操作，暂无法支持）
    * 小程序原生的showModal、showActionSheet上的点击操作，无法录制&回放。虽然可以往wxa/core植入点代码，知道用户点击了哪个，执行了哪个函数。但回放的时候，原生的元素取不到，如果直接执行对应函数的话，modal弹框会一直在界面上，除非用户操作不然都不会消失
* 已知bug：
    * 暂无
* 待优化：
    * 不带-r参数时，即回放模式，仅添加元素id（回放测试用例时能找到对应元素），不侵入过多代码（现在会劫持各种tap等事件，植入全局按钮组件）

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
            "args": ["test", "--e2e", "-r"],
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
* 微信开发者工具，打开对应项目，勾选`不校验合法域名`
* windows系统，wxa.config.js里配置wechatwebdevtools: 微信开发者工具目录
* 项目目录下执行`wxa2 test --e2e -r`,开启录制模式
* 开始脚本录制，录制完成后脚本会保存在`__wxa_e2e_test__`目录下
* 脚本都录制完毕后需执行，`wxa2 test --e2e --base ` 回放用例并检查录制内容是否正确，且此次回放的截屏会作为后续回放用例的比较基准,用于判断测试是否通过,`--test=testName`可指定要回放的用例，多个用例逗号分隔

### 测试脚本回放
* `npm i -g jest`
* 项目下执行 `npm i miniprogram-automator looks-same`
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
* `wxa2 test --e2e` 进入测试用例回放模式，`--test=testName`指定执行用例，多个用例逗号分隔，操作截屏以时间命名保存在测试用例目录中，带参数`--screenshot`则会与`expect_screenshot`的截屏进行diff


### 二次开发录制好的测试用例
通过修改`测试用例/record.js`，可以进行用例二次开发
record.js是一个数组，每一项Object对应用户一次操作（点击、输入or删除一个字符）

|key|类型|默认值|备注|
| :-----| :---- | :---- | :---- |
| action | Object| 本次操作信息,小程序包装好的事件信息，可<a href="https://developers.weixin.qq.com/miniprogram/dev/framework/view/wxml/event.html">查看文档</a> | 【type：操作类型，tap touchstart点击，input输入】<br> 【currentTarget.dataset._wxatestuniqueid：触发事件的页面元素id】<br/>|
| screenshotDiff | Boolean| false | 每一步操作截屏，是否要和expect_screenshot进行diff比对。启动命令带--screenshot参数时，忽略该配置，都会截屏diff比对。 |
| coustomExpect | Function| - | 编写自定义期望条件 |

