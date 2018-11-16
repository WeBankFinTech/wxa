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

    // filter data without __webviewId__ from this.data
    let oldData = Object.keys(newData).reduce((prev, key)=>{
        if (key === '__webviewId__') return prev;

        if (this.data.hasOwnProperty(key)) {
            prev[key] = this.data[key];
        };
        return prev;
    }, {});

    let diffValue = diff(oldData, newData);

    return flatten(oldData, newData, diffValue);
}

