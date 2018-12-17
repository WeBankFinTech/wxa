# @wxa/plugin-dependencies-analysis

使用`@wxa/plugin-dependencies-analysis`可以将项目构建后的模块依赖关系、体积大小等信息可视化, 方便分析项目的优化空间。

## 安装
``` bash
# 使用npm安装
npm i -D @wxa/plugin-dependencies-analysis
```

## 用例
```javascript
// wxa.config.js
const DependenciesAnalysisPlugin = require('@wxa/plugin-dependencies-analysis').DependenciesAnalysisPlugin;

module.exports = {
  plugins: [
    new DependenciesAnalysisPlugin({ 
      // 默认8080端口
      port: 3000 
    })
  ]
}
```