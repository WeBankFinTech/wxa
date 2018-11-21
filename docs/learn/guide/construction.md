# 目录结构
小程序包含一个描述整体程序的 app 和多个描述各自页面的 page。

## 主体部分
一个小程序主体部分由三个文件组成，必须放在项目的根目录，如下：
| 文件    | 必填 | 作用 | 
|--------|:----|:-----|
| app.js   | 是 | 小程序逻辑 |
| app.json | 是 | 小程序公共设置 |
| app.wxss | 否 | 小程序公共样式表 |

由于`@wxa/cli`支持Vue单文件模式，上述主体部分也可以这些写：

| 文件    | 必填 | 作用 | 
|--------|:----|:-----|
| app.wxa   | 是 | 小程序主体逻辑 |

对应`app.wxa`文件的结构为：
```vue
<script>
    // 对应主体逻辑，js
</script>
<config lang="json">
    <!-- 对应小程序全局配置，json -->
</config>
<style lang="sass">
    /* 对应公共样式表，wxss */
</style>
```
## 页面部分

一个小程序页面由四个文件组成，分别是：
| 文件    | 必填 | 作用 | 
|--------|:----|:-----|
| js   | 是 | 	页面逻辑 |
| wxml | 是 | 	页面结构 |
| wxss | 否 | 页面样式表 |
| json | 否 | 页面配置 |

对应`.wxa`文件的结构为：
```vue
<template>
    <!-- 对应页面结构，wxml -->
</template>
<script>
    // 对应页面逻辑，js
</script>
<config lang="json">
    <!-- 对应页面配置，json -->
</config>
<style lang="sass">
    /* 对应页面样式表，wxss */
</style>
```