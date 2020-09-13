/**
 * watch plugin for wxa.js
 * 
 * Usage: 
 *  class A {
        data = {
            a: {
                b: 1
            }
        }

        watch = {
            'a.b'(){
            }
        }
    }
 */

import WatchJS from 'melanke-watchjs';
import {diff} from '@wxa/core';

function computeValue() {
    let cachedComputedResult = {};
    Object.keys(this.computed).forEach((computedGetterName) => {
        if (!this.$$wxaComputedInited && this.data[computedGetterName]) {
            return console.warn(`[wxa/watch] ${computedGetterName} is defined. Do not dulplicate define in computed object`)
        }

        let computtedSetter = this.computed[computedGetterName].bind(this);
        cachedComputedResult[computedGetterName] = computtedSetter();
    });

    let diffData = diff.bind(this)(cachedComputedResult);
    // console.log('diffData', diffData);
    if (Object.keys(diffData)) this.setData(diffData);
    this.$$wxaComputedValue = {...diffData};
    this.$$wxaComputedInited = true;
}

// TODOS 增加组件 watch 和 computed 支持
export default ()=>{
    return (vm, type)=>{
        if (type === 'Page') {
            let onload = vm.onLoad || function() {};
            let onUnload = vm.onUnload || function() {};

            vm.onLoad = function(...args) {
                this.$$WXAWatcher = [];
                if (this.watch && this.data) {
                    Object.keys(this.watch).forEach((key)=>{
                        let keyArr = key.split(/[.\[\]]/).filter((x)=>x!=null&&x!=='');

                        let tar = keyArr[keyArr.length-1];

                        let source = keyArr.slice(0, -1).reduce((prev, key)=>{
                            if(typeof prev === 'object') {
                                prev = prev[key];
                                return prev;
                            } else {
                                return void(0);
                            }
                        }, this.data);

                        if(source) {
                            this.$$WXAWatcher.push([source, tar, (prop, action, newValue, oldValue)=>{
                                this.watch[key].apply(this, [newValue, oldValue]);
                            }]);
                        }
                    });
                }

                this.$$wxaComputedValue = {};
                if (this.computed && this.data) {
                    computeValue.call(this);

                    this.$$WXAWatcher.push([this, ['data'], computeValue.bind(this)]);
                }

                this.$$WXAWatcher.forEach((subscriber)=>{
                    WatchJS.watch(subscriber[0], [subscriber[1]], subscriber[2]);
                });

                onload.apply(this, args);
            };

            vm.onUnload = function(...args) {
                if ( Array.isArray(this.$$WXAWatcher) && this.$$WXAWatcher.length ) {
                    this.$$WXAWatcher.forEach((subscriber)=>{
                        WatchJS.unwatch(subscriber[0], [subscriber[1]], subscriber[2]);
                    });
                }

                onUnload.apply(this, args);
            };
        }
    };
};
