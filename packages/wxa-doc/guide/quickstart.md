# 快速开始
wxa提供了一个方便好用的`cli`工具，使用cli可以从源站（github或者gitlab之类的）拉取手脚架，快速开始小程序开发

::: warning 注意
请注意node.js版本 >= 8
:::

## 新建项目
### 1. 安装cli
```bash
# 全局安装@wxa/cli
npm i -g @wxa/cli
``` 

### 2. 创建项目
```bash
# 在当前目录使用wxa-template-base手脚架，创建helloWorld项目
wxa create base helloWorld

# 进入项目目录
cd helloWorld

# 安装项目依赖
npm i
```

### 3. 编译项目
```bash
# watch模式编译项目
wxa build --watch
```

### 4. 从微信开发者工具打开
在微信开发者工具中填入小程序appid，把目录指向`path/to/helloWorld/dist`。然后就可以开始wxa项目开发了！

## 现有项目
原有的小程序项目可以不改动代码的情况下快速迁移到wxa下！只需要稍微加配置，旧的小程序项目一样可以享受`@wxa`提供的便利~

::: warning 注意
迁移项目到wxa前注意备份代码, 方便迁移失败回退。例如`git checkout -b backup`
:::

::: warning 注意
请注意node.js版本 >= 8
:::

### 1. 安装Cli
```bash
# 全局安装@wxa/cli
npm i -g @wxa/cli
``` 

### 2. 安装项目依赖
::: warning 注意
如果之前没有接入`npm`，则先运行`npm init`初始化。
:::
```bash
# 打开项目目录
# cd path/to/your/project/

# 安装依赖
npm i @wxa/core @wxa/plugin-replace @wxa/plugin-uglifyjs @wxa/compiler-babel @wxa/compiler-sass babel-eslint babel-plugin-transform-class-properties babel-plugin-transform-decorators-legacy babel-plugin-transform-export-extensions babel-plugin-transform-object-rest-spread babel-preset-env
```

### 2. 添加配置
添加`wxa.config.js`到项目目录 
```javascript
    const path = require('path');
    const UglifyjsPlugin = require('@wxa/plugin-uglifyjs');
    const ReplacePlugin = require('@wxa/plugin-replace');
    let prod = process.env.NODE_ENV === 'production';
    const env = process.env.NODE_ENV || 'development';

    // 生产和测试环境参数配置
    const envlist = require('./app.config')[env];
    module.exports = {
        // 指定微信开发者工具的目录，用于从cli调用其接口
        wechatwebdevtools: '/Applications/wechatwebdevtools.app',
        // 解析配置
        resolve: {
            alias: {
                '@': path.join(__dirname, 'src'),
            },
        },
        // 使用到的compiler
        use: ['babel', 'sass'],
        // compiler的配置，如果需要单独配置compiler，写在这里
        compilers: {
            // 下面的babel配置也可以写到.babelrc中
            babel: {
                "sourceMap": false,
                "presets": ["env"],
                "plugins": [
                    "transform-class-properties",
                    "transform-decorators-legacy",
                    "transform-object-rest-spread",
                    "transform-export-extensions"
                ],
                "ignore": "node_modules"
            }
        },
        // 使用到的plugins
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

### 3. 编译项目
```bash
# watch模式编译项目
wxa build --watch
```

### 4. 从微信开发者工具打开
在微信开发者工具中填入小程序appid，把目录指向`path/to/your/project/dist`。然后就可以开始wxa项目开发了！
