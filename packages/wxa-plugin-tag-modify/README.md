# wxa-plugin-tag-plugin

打包阶段批量修改wxml标签

## install
```
npm install -S @wxa/plugin-tag-modify
```


## Usage
### 在wxa打包配置中使用
使用插件时，需要实例化插件并传入参数，支持拦截所有事件和指定拦截事件
```javascript
// wxa.config.js
const BindHijackPlugin = require('@wxa/plugin-bind-hijack');

module.exports = {
    resolve: {
        alias: {
            '@': path.join(__dirname, 'src'),
        },
    },
    use: ['babel', 'sass'],
    plugins: [
        // 批量修改image标签，增加binderror属性、调整src
        new TagModifyPlugin([{
            target: 'image',
            operateFn: (attribs) => {
                if (!attribs.binderror) attribs.binderror = 'imageOnError';
                if (attribs.src) attribs.src = attribs.src.replace('WEB_STATIC_URL', '{{CDNBaseUrl}}');
                return attribs;
            }
        }])
    ]
}
```
