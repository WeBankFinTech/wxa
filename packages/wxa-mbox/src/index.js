

// // store
// import { observable } from 'mobx'
// import { connect, extract } from 'mobx-wxapp'
// const store = observable({
//     // observable
//     seconds: 0,

//     // computed
//     get color() {
//         return this.seconds % 2 ? 'red' : 'green'
//     },

//     // actions
//     tick() {
//         this.seconds += 1
//     }
// })

// // page
// Page({
//     onLoad() {
//         connect(this, () => ({
//             title: appStore.title,

//             color: store.color,
//             seconds: store.seconds
//             // ...extract(store) //或使用 extract 提取全部属性
//         })
//         )
//     },
//     add() {
//         store.tick()
//     }
// })

//     // wxml
// < view > {{ title }} :</view >
// <view style="color:{{ color }}"> seconds:{{ seconds }} </view>
// <button bindtap="add">add</button>


import { autorun, observable, isObservableObject, isObservableArray, isBoxedObservable, isObservableMap, toJS } from 'mobx';
import { diff, isTypeFunction, extract } from './utils'


// export { connect, extract, equals }
/**
 * 映射所需的数据到data
 * @param {Object} context
 * @param {Function} mapDataToStore
 * @param {Object} options
 */
function connect(context, mapDataToStore, options = {}) {
    if (!isTypeFunction(mapDataToStore)) {
        throw new TypeError('mapDataToStore 必须是一个function')
    }

    const delay = options.delay || 30 // setData执行的最小间隔
    const callback = options.setDataCallback || (() => { }) // setData的回调

    let tempdata = {}
    let last = 0
    const update = nextdata => {
        Object.assign(tempdata, nextdata)
        clearTimeout(last)
        last = setTimeout(() => {
            const newValue = diff(context.data, tempdata)
            console.log('new data:', newValue)
            context.setData(newValue, () => {
                callback(newValue)
            })
            tempdata = {}
        }, delay)
    }
    const func = mapDataToStore
    mapDataToStore = function () {
        const data = func()
        for (let k in data) {
            const item = data[k]
            if (
                isObservableObject(item) ||
                isObservableArray(item) ||
                isObservableObject(item) ||
                isBoxedObservable(item) ||
                isObservableMap(item)
            ) {
                data[k] = toJS(item)
            }
        }
        update(data)
    }
    const disposer = autorun(mapDataToStore)
    // const onUnload = context.onUnload
    // if (onUnload) {
    //     context.onUnload = function () {
    //         disposer()
    //         onUnload.apply(context, arguments)
    //     }
    // }
    return disposer
}

export default () => {
    return (vm, type) => {
        if (type === 'Page') {
            let onload = vm.onLoad || function () { };
            let onUnload = vm.onUnload || function () { };
            let disposer = function () { };

            vm.onLoad = function (...args) {
                this.$$store = observable(this.store || {});
                disposer = connect(this, () => ({ ...extract(this.$$store) }));
                onload.apply(this, args);
            };

            vm.onUnload = function (...args) {
                disposer()
                onUnload.apply(this, args);
            };
        }
    };
};
