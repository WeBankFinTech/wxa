# wxa-validate表单校验
wxa-validate参照了[vee-validate](https://logaretm.github.io/vee-validate/)的实现思路在wxa内提供了便捷的表单校验功能

## 安装
- yarn
> yarn add @wxa/validate
- npm
> npm i @wxa/validate --save

## 在app.js文件中引入
```javascript
import {
    wxa
} from '@wxa/core';
import WxaValidate from '@wxa/validate';

wxa.use(WxaValidate);
```
## 在具体页面中使用
引入wxa-validate之后，在页面里中可以直接通过`this.func`的格式使用入以下属性和方法：

|名称|类型|作用|
|------|-----|-----|
|$form|属性|{<br>&nbsp;&nbsp;&nbsp;&nbsp;dirty: false, // 用户是否有接触表单 <br>&nbsp;&nbsp;&nbsp;&nbsp;valid: { //已经校验的表单信息<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;name: true // 表单中data-name的输入框输入值符合要求<br>&nbsp;&nbsp;&nbsp;&nbsp;}<br>&nbsp;&nbsp;&nbsp;&nbsp;errMsgs: ['请输入name'] // 用于反显给用户的错误信息<br>}<br>`可以在开发者工具中AppData页卡查看完整数据`|
|$type|方法|更新对应value，如下面代码中由于`data-name="name"`，用户输入之后该方法会直接更新`this.data.name`的值|
|$typeAndValidate|方法|1、执行$type更新对应value；2、执行规则校验|
|$validate|方法|校验某个input的输入值，如在页面中执行`this.$validate('name')`会去校验`data-name="name"`的输入框值，返回结果为`true`或者`false`|
|$validateAll|方法|通常用于最后的表单提交，方法会返回一个`promise`|

原生微信input元素使用wxa-validate示例：
```
<input
    class="wxa-input"
    type="text"
    maxlength="20"
    placeholder="请填写姓名"
    placeholder-class="psection"
    value="{{name}}"
    data-name="name"
    data-rule="required|username"
    bindinput="$typeAndValidate"
    bindfocus="$clearErrorMsg"
    bindblur="$validate"/>

<view class="item-error" wx:if="{{$form.dirty && !$form.valid.name}}">请填写有效中文姓名</view>
```
原生微信picker元素使用wxa-validate示例：
```
<picker
    class="item-picker wxa-input"
    mode="selector"
    range="{{genderList}}"
    value="{{gender}}"
    data-name="gender"
    data-rule="required"
    bindchange="$typeAndValidate">
        <view class="picker-text">{{filter.gender(gender) || '请选择性别'}}</view>
</picker>

<view class="item-error" wx:if="{{$form.dirty && !$form.valid.gender}}">请选择性别</view>
```


`注意：所有需要使用wxa-validate做校验的input、picker等元素的class属性必须包含有wxa-input`

提交表单信息示例：
```
this.$validateAll().then(res => {
    if (res.valid) {
        ...
    }
}, err => {
    console.warn(err);
});
```

### 模版中使用插件
```html
<input value='{{pwdConfirme}}' data-rule="required|password|weakPwd|confirmed:.confirmed" data-name="pwdConfirme" bindinput="$validate"type="number" maxlength="6"/>
</view>
<view wx:if="{{$form.errMap['pwdConfirme'].password}}">交易密码格式不对，请重新输入</view>
<view wx:elif="{{$form.errMap['pwdConfirme'].weakPwd}}">交易密码过于简单，请重新输入</view>
<view wx:elif="{{$form.errMap['pwdConfirme'].confirmed}}">两次密码不一致，请重新输入</view>
```

上面代码中input使用了4个校验规则：required、password、weakPwd、confirmed。

其中confirmed规则带了参数.confirmed，插件会获取（wx.createSelectorQuery().select('.confirmed')）对应组件的值作比较。