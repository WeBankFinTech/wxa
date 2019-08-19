# wxa-compiler-sass
sass 编译器

## Install 
``` sh
npm i -D @wxa/compiler-sass
```

## Usage

### 使用默认配置

```javascript
// wxa.config.js
module.exports = {
    use: ['sass'],
}
```

### 指定 sass 配置

```javascript
// wxa.config.js
module.exports = {
    use: [{
        name: 'sass',
        test: /\.sass$|\.scss$/,
        options: {}
    }],
}
```

sass 相关配置请查看 [node-sass](https://github.com/sass/node-sass)
