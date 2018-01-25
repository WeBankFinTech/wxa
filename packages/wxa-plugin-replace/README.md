# wxa-plugin-replace
replace string in wxa
# Usage
## add replace target
```javascript
    new ReplacePlugin({
      list: [{
        regular: new RegExp('APP_ENV', 'gm'),
        value: 'bcds'
      }]
    })
```
