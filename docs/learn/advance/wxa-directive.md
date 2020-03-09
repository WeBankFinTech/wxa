# 指令

## wxa:mock

mock指令用于在开发阶段，自动为input元素填入随机值，提高开发阶段的自测效率。

### 使用

```html
<!-- 数据占位符模式 -->
<input wxa:mock="@name()">

<!-- 固定值模式 -->
<input wxa:mock="abc">
```
     
`npm run dev --mock`

### 用例
- **自动填入指定区间的随机身份证号**
    ```html
    <input wxa:mock="@idNo(1995, 2000)">  
    <input wxa:mock="@constellation()">
    <input wxa:mock="@bankcardNo()">
    ```
    | 结果 |
    | - |
    | 440304199706120237 |
    | 天秤座 |
    | 6227004877233   |

- **自动填入Mock.js数据占位符定义规则生成的值**
    ```html
    <input wxa:mock="@cname()">
    <input wxa:mock="@city()">
    <input wxa:mock="@datetime('yyyy-MM-dd A HH:mm:ss')">
    ```
    | 结果 |
    | - |
    | 周润发 |
    | 深圳市 |
    | 2020-03-09 AM 18:50:25 |

- **自动填入固定值**
    ```html
    <input wxa:mock="生活就像海洋，只有意志坚强的人，才能到达彼岸">
    ```
    | 结果|
    | ------------ |
    | 生活就像海洋，只有意志坚强的人，才能到达彼岸 |

### 注意

- 当前wxa:mock生效的条件为：除 `NODE_ENV` 为`prod`与`production`以外的cli编译环境

- 自动填入的实现方式为自动调用 `setData` 函数，且会为不存在与data的数据绑定的input自动生成绑定


### 拓展

可在cli下的`mock-extends.js`文件内，对mock规则进行自定义拓展

例如拓展一个生成星座的规则:
```js
function constellation(rule) {
    let constellations = ['白羊座', '金牛座', '双子座', '巨蟹座', '狮子座', '处女座', '天秤座', '天蝎座', '射手座', '摩羯座', '水瓶座', '双鱼座'];
    return this.pick(constellations);
}
```

使用（自动填入随机星座）

```html
<input wxa:mock="@constellation()">
```
结果
| 狮子座 |
| ------------ |
