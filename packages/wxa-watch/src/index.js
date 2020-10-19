/**
 * watch plugin for wxa.js
 * 
 * Usage: 
 * watch 
 * computed
 */

import WatchJS from 'melanke-watchjs';
import {diff} from '@wxa/core';

const simpleDeepClone = (val) => {
    if (val == null) return val;
    try {
        let ret = JSON.parse(JSON.stringify(val));
        return ret;
    } catch(e) {
        console.error('[@wxa/watch] 深拷贝失败 ', e);
        return Object.assign({}, val);
    }
}

function computeValue() {
    let cachedComputedResult = {};
    Object.keys(this.computed).forEach((computedGetterName) => {
        if (!this.$$wxaComputedInited && this.data[computedGetterName]) {
            return console.warn(`[wxa/watch] ${computedGetterName} is defined. Do not dulplicate define in computed object`)
        }

        let computtedSetter = this.computed[computedGetterName].bind(this);
        cachedComputedResult[computedGetterName] = simpleDeepClone(computtedSetter());
    });

    let diffData = diff.bind(this)(cachedComputedResult);
    // console.log('diffData', diffData);
    if (Object.keys(diffData)) this.setData(diffData);
    this.$$wxaComputedValue = {...cachedComputedResult};
    this.$$wxaComputedInited = true;
}

function watchData() {
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

function mountWatcher() {
    this.$$WXAWatcher = [];
                
    if (this.watch && this.data) watchData.call(this);

    this.$$wxaComputedValue = {};
    if (this.computed && this.data) {
        computeValue.call(this);

        this.$$WXAWatcher.push([this, ['data'], computeValue.bind(this)]);
    }

    this.$$WXAWatcher.forEach((subscriber)=>{
        WatchJS.watch(subscriber[0], [subscriber[1]], subscriber[2]);
    });
}

function unmoutWatcher() {
    if ( Array.isArray(this.$$WXAWatcher) && this.$$WXAWatcher.length ) {
        this.$$WXAWatcher.forEach((subscriber)=>{
            WatchJS.unwatch(subscriber[0], [subscriber[1]], subscriber[2]);
        });
    }
}

export default ()=>{
    return (vm, type)=>{
        const normalType = type.toLowerCase();
        if (normalType === 'page') {
            let onload = vm.onLoad || function() {};
            let onUnload = vm.onUnload || function() {};

            vm.onLoad = function(...args) {
                mountWatcher.apply(this);

                onload.apply(this, args);
            };

            vm.onUnload = function(...args) {
                unmoutWatcher.apply(this);

                onUnload.apply(this, args);
            };
        } else if (normalType === 'component') {
            let attached = (vm.lifetimes ? vm.lifetimes.attached : vm.attached) || function() {};
            let detached = (vm.lifetimes ? vm.lifetimes.detached : vm.detached) || function() {};

            vm.lifetimes = {...vm.lifetimes};

            vm.lifetimes.attached = function(...args) {
                mountWatcher.apply(this);
                attached.apply(this, args);
            }

            vm.lifetimes.detached = function(...args) {
                unmoutWatcher.apply(this);
                detached.apply(this, args);
            }
        }
    };
};
