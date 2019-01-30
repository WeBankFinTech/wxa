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

export default ()=>{
    return (vm, type)=>{
        if (type === 'Page') {
            let onload = vm.onLoad || function() {};
            let onUnload = vm.onUnload || function() {};

            let watcher = [];
            let isInit = false;

            vm.onLoad = function(...args) {
                if (this.watch && !isInit && this.data) {
                    isInit = true;

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
                            watcher.push([source, tar, (prop, action, newValue, oldValue)=>{
                                this.watch[key].apply(this, [newValue, oldValue]);
                            }]);
                        }
                    });
                }
                watcher.forEach((subscriber)=>{
                    WatchJS.watch(subscriber[0], [subscriber[1]], subscriber[2]);
                });

                onload.apply(this, args);
            };

            vm.onUnload = function(...args) {
                watcher.forEach((subscriber)=>{
                    WatchJS.unwatch(subscriber[0], [subscriber[1]], subscriber[2]);
                });

                onUnload.apply(this, args);
            };
        }
    };
};
