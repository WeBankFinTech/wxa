# 其他

## message( title, content, options )
- **参数**:
    - **title**: `String` 标题
    - **content**：`String` 内容
    - **options**：`Object` 参考[微信文档](https://developers.weixin.qq.com/miniprogram/dev/api/ui/interaction/wx.showModal.html)

显示模态对话框。

```js
import {message} from '@wxa/core';

// 简单的消息提示
message('', '网络错误');
// 处理回调
message('', '是否选择放弃', {showCancel: false, confirmText: 'No'})
.then(({confirm})=>{
    console.log('Never Give Up~')
});
```

## toast( title, options )
- **参数**:
    - **title**: `String` 标题
    - **options**：`Object` 参考[微信文档](https://developers.weixin.qq.com/miniprogram/dev/api/ui/interaction/wx.showToast.html)

显示消息提示框

```js
import {toast} from '@wxa/core';

// 简单的消息
toast('输入有误');
// 处理回调
toast('输入有误')
.then(()=>{
    console.log('callback here');
});
```

::: tip 提示
toast 会默认帮你打开mask，防止用户误触其他回调。
:::