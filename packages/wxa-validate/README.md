wxa-validate is a template-based validation framework for Wxa that allows you to validate inputs and display errors.

## Installation
- yarn
> yarn add @wxa/validate
- npm
> npm i @wxa/validate --save

# Get Started

### 引入插件
```javascript
    import {
        wxa
    } from '@wxa/core';
    import WxaValidate from '@wxa/validate';
    
    wxa.use(WxaValidate);
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