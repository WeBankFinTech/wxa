import mapState from './mapState'
import {diff} from '@wxa/core'
import {
    createStore,
    applyMiddleware
} from 'redux'

let mountRedux = function (originHook) {
    return function (...args) {
        this.$$reduxDiff = diff.bind(this);
        if(this.$store) {
            let connectState = ()=>{
                let newState = this.$store.getState();
                let lastState = this.$$storeLastState;
                let data = mapState(this.mapState, newState, lastState, this);

                if (data !== null) {
                    // 有效state
                    this.$$storeLastState = data;
                    let diffData = this.$$reduxDiff(data);
                    this.setData(diffData);
                }
            }
            this.$unsubscribe = this.$store.subscribe((...args) => {
                // Object updated && page is showing
                if(this.$$isCurrentPage) {
                    connectState();
                }
            });
            connectState();
        }
        if (originHook) originHook.apply(this, args);
    }
}

let unmountRedux = function (originUnmount) {
    return function (...args) {
        if (this.$unsubscribe) {
            this.$unsubscribe();
            this.$unsubscribe = null;
        }
        if (originUnmount) originUnmount.apply(this, args);
    }
}

export const wxaRedux = (options = {}) => {
    let reducers;
    let middlewares;
    let isArray = false;
    if (Array.isArray(options)) {
        reducers = options[0];
        isArray = true;
    } else {
        reducers = options.reducers;
        middlewares = options.middlewares;
    }

    if(reducers == null) console.warn('不存在reducer, redux插件将无法工作。')

    return (vm, type) => {
        if (type === 'App' && reducers) {
            let args = options;
            if (!isArray) {
                args = [reducers];
                if (Array.isArray(middlewares)) args.push(applyMiddleware(...middlewares));
            } 
            
            vm.$store = createStore.apply(null, args);
        } else if (type === 'Page') {
            vm.$store = getApp().$store;
            let {
                onLoad,
                onShow,
                onUnload,
                onHide
            } = vm;
            vm.onLoad = mountRedux(onLoad);
            vm.onShow = function (...args) {
                this.$$isCurrentPage = true;
                let data = mapState(this.mapState, this.$store.getState(), this.$$storeLastState, this);
                if (data != null) {
                    let diffData = this.$$reduxDiff(data)
                    this.setData(diffData)
                };
                if (onShow) onShow.apply(this, args);
            }
            vm.onHide = function (...args) {
                this.$$isCurrentPage = false;
                if (onHide) onHide.apply(this, args);
            }
            vm.onUnload = unmountRedux(onUnload);
        } else if (type === 'Component') {
            let {
                created,
                attached,
                detached
            } = vm;
            vm.created = function (...args) {
                this.$store = getApp().$store;
                if (created) created.apply(this, args);
            }
            vm.$$isCurrentPage = true;
            vm.attached = mountRedux(attached);
            vm.detached = unmountRedux(detached);
        } else {
            throw new Error('不合法的wxa组件类型');
        }
    };
}

export * from 'redux';