# wxa-compiler-stylus
stylus 编译器

## Install 
``` sh
npm i -D @wxa/compiler-stylus
```

## Usage

### 使用默认配置

```javascript
// wxa.config.js
module.exports = {
    use: ['stylus'],
}
```

### 指定 stylus 配置

```javascript
// wxa.config.js
module.exports = {
    use: [{
        name: 'stylus',
        test: /\.styl$|\.stylus$/,
        options: {}
    }],
}
```

stylus 相关配置请查看 [stylus](http://stylus-lang.com/docs/js.html)
