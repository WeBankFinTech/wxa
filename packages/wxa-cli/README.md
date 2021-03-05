# wxa小程序e2e自动化测试
* 支持事件
	* bindtap、bindlongpress、bindchange、input、touchstart、touchmove、touchend
    * showModal、showActionSheet 回放过程会直接mock掉，界面上不会弹出交互
* 目前无法支持：
    * catchtap、catchlongpress等阻止冒泡事件（自动化element.tap、element.longpress等方法无法阻止冒泡）
	* 主动操作返回（因无法监听返回事件，所以录制过程中 *点击物理返回键*、*小程序titlebar返回键*、*ios手势返回*等返回操作，暂无法支持）
* 已知bug：
    * 暂无
* 待优化&计划：
    * 不带-r参数时，即回放模式，仅添加元素id（回放测试用例时能找到对应元素），不侵入过多代码（现在会劫持各种tap等事件，植入全局按钮组件）
    * 高大上网页版测试报告
    * 【用例复用】：支持用例复用-公共用例不用重复录制（如：登陆模块只需要录制一次，其他用例复用，当登录模块更改时，只需要重新录制一次登录，不需要每个用例都重新录制）
    * 【真机】：支持真机
    * 【服务器】：有个公共服务器解决用例执行的问题
    * 各种未知bug

2020年3月2日
# 使用手册

### 安装
* 项目下安装 `npm i -DE miniprogram-automator looks-same wxa-cli2-apple jest`

### 测试脚本录制
1. 微信开发者工具，打开对应项目，勾选`不校验合法域名`
2. windows系统，wxa.config.js里增加属性`wechatwebdevtools `，配置微信开发者工具的安装目录
3. 项目目录下执行`wxa2-apple test --e2e -r`,开启录制模式
* 用开发者工具打开项目，页面左上角有`结束录制`button，说明已成功开启录制模式
* 此时与小程序的每一步交互都会录制为脚本，完成操作后，点击`结束录制`，输入用例名，对应脚本保存在`__wxa_e2e_test__`目录下

### 进行基准截屏  
脚本录制过程中不会截屏，需要跑一次case脚本，完成基准截屏。若无基准截屏，用例回归时就不知道测试结果是否正确，所以这一步骤是必须的

* 脚本录制完毕后，需执行`wxa2-apple test --e2e --base ` 回放用例，检查录制操作是否正确，且此次回放的截屏会作为后续回放用例的比较基准,用于判断测试是否通过
* 基准截屏存放在`__wxa_e2e_test__/用例名/base_screenshot`中（`--test=test1,test2`可指定要回放的用例，多个用例逗号分隔）

### 测试脚本回放
* 开发者工具修改调试基础库 2.7.3以上（src/project.config.json需同步修改libVersion）
* 项目根目录下添加文件`babel.config.js`

```
const path = require('path');
const existsSync = require('fs').existsSync;


// try to find @babel/runtime to decide whether add @babel/plugin-transform-runtime.
const cwd = process.cwd();
const babelRuntime = path.join(cwd, 'node_modules', '@babel/runtime/package.json');
let hasRuntime = existsSync(babelRuntime);

const commonConfigs = {

    'plugins': [
        ['@babel/plugin-proposal-decorators', {'decoratorsBeforeExport': true}],
        ['@babel/plugin-proposal-class-properties'],
    ],
    'presets': ['@babel/preset-env'],

};
if (hasRuntime) {
    const pkg = require(babelRuntime);

    commonConfigs.plugins.unshift(['@babel/plugin-transform-runtime', {'version': pkg.version || '7.2.0'}]);
}

module.exports = {
    'sourceMap': false,
    'ignore': [],
    overrides: [{
        exclude: [/node_modules/, /wxa-cli/],
        ...commonConfigs
    },
    {
        test: /wxa-e2eTest/,
        ...commonConfigs
    }
]
};

```
* `wxa2-apple test --e2e` 进入测试用例回放模式，操作截屏以时间命名保存在测试用例目录中（`--test=test1,test2`指定执行用例，多个用例逗号分隔）


### 二次开发录制好的测试用例
通过修改`测试用例/record.js`，可以进行用例二次开发
record.js是一个数组，每一项Object对应用户一次操作（点击、输入or删除一个字符）

|key|类型|默认值|备注|
| :-----| :---- | :---- | :---- |
| action | Object| 本次操作信息,小程序包装好的事件信息，可<a href="https://developers.weixin.qq.com/miniprogram/dev/framework/view/wxml/event.html">查看文档</a> | 【type：操作类型，tap touchstart点击，input输入】<br> 【currentTarget.dataset._wxatestuniqueid：触发事件的页面元素id】<br/>|
| screenshotDiff | Boolean| true | 此次交互后的截屏，是否要和base_screenshot目录下的首次截屏进行差异比对|
| coustomExpect | Function| - | 编写自定义期望条件 |

### wxa2-apple可支持的参数
* `--no-mock` `wxa2-apple test --e2e --no-mock`此次用例回归，不mock api，直连真实接口（默认会用录制时的api数据来mock）
* `--screenshot-diff` `wxa2-apple test --e2e --screenshot-diff=fasle` 此次用例回归，截屏是否要和base_screenshot目录下的首次截屏进行比对（不传值默认会比对，false不比对）
* `--custom-expect` 进行自定义期望匹配，需要record.js里每一步的customExpect函数编写期望代码

```
module.exports = [
    {
        "action": {
        	.....
        },
        customExpect() {
       	//自定义期望匹配函数
        }
    },{
    ...
```
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

