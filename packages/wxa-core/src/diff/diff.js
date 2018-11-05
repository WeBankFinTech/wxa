import {diff} from 'deep-object-diff';
import flatten from './flatten';

export default function(newData) {
    if (
        newData == null ||
        Object.prototype.toString.call(newData) !== '[object Object]'
    ) {
        console.warn('参数错误，data必须为object类型');
        return false;
    }

    if (this == null || this.data == null) {
        console.warn('请绑定diff函数到Page/Component实例！');
        return false;
    };

    let diffValue = diff(this.data, newData);

    return flatten(this.data, newData, diffValue);
}

