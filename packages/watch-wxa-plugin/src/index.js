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

export default (options)=>{
    return (vm, type)=>{
        if (type === 'Page') {
            let onload = vm.onLoad || function() {};
            let onUnload = vm.onUnload || function() {};

            let watcher = [];

            vm.onLoad = function(...args) {
                try {
                    if (this.watch) {
                        Object.keys(this.watch).forEach((key)=>{
                            let keyArr = key.split(/[.\[\]]/).filter((x)=>x!=null&&x!=='');

                            let tar = keyArr[keyArr.length-1];

                            let source = keyArr.slice(0, -1).reduce((prev, key)=>{
                                try {
                                    prev = prev[key];
                                } catch (e) {
                                    console.error(e);
                                }
                                return prev;
                            }, this.data);

                            watcher.push([source, tar, (prop, action, newValue, oldValue)=>{
                                this.watch[key].apply(this, [newValue, oldValue]);
                            }]);
                        });
                    }
                    watcher.forEach((subscriber)=>{
                        WatchJS.watch(subscriber[0], [subscriber[1]], subscriber[2]);
                    });
                } catch (e) {
                    console.log('watch mount fail');
                    console.error(e);
                }

                onload.apply(this, args);
            };

            vm.onUnload = function(...args) {
                try {
                    watcher.forEach((subscriber)=>{
                        WatchJS.unwatch(subscriber[0], [subscriber[1]], subscriber[2]);
                    });
                } catch (e) {
                    console.log('watch unmount fail');
                    console.error(e);
                }

                onUnload.apply(this, args);
                watcher = [];
                // onload = null;
                // onUnload =null;
            };
        }
    };
};
