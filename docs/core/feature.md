# 内置方法

## 页面实例 / 自定义组件实例
### $go( event )
- **参数**：
    - **event**：小程序事件回调对象。
- **用例**：
```xml
<!-- 相当于调用this.$router.push('/pages/log') -->
<view bindtap="$go" data-path="/pages/log">去日志页</view>
<!-- 相当于调用this.$router.replace('/pages/log') -->
<view bindtap="$go" data-type="replace" data-path="/pages/log">去日志页</view>
```
重构阶段可以无需写任何逻辑，快速实现页面之间的跳转。

### $diff( newData, cb)
- **参数**: 
    - **newData**: `Object` 更新的数据
    - **cb**: `Function` setData引起的界面更新渲染完毕后的回调函数
- **用例**:

对更新的数据进行`diff`，然后根据小程序setData的特性进行`flatten`处理之后，在调用setData设置数据，以得到增量更新的效果，对于大的Object而言有很好效益，提高setData效率，减少重绘。