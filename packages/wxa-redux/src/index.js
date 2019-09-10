import mapState from './mapState';
import reducerRegistry from './registry';
import {diff} from '@wxa/core';

import {
    createStore,
    combineReducers,
    applyMiddleware
} from 'redux'

const combine = (registryReducers, userReducers) => {
    // if the user directly pass combined reducers to plugin, then we need to use it directly;
    if (typeof userReducers === 'function') return userReducers;

    // const reducerNames = Object.keys(reducers);
    // Object.keys(initialState).forEach(item => {
    //     if (reducerNames.indexOf(item) === -1) {
    //         reducers[item] = (state = null) => state;
    //     }
    // });
    return combineReducers({...registryReducers, ...userReducers});
};

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
    // get options.
    let args = [];
    let userReducers;
    if (Array.isArray(options)) {
        userReducers = options[0];
        // object reducer
        args = [combine(reducerRegistry.getReducers(), userReducers), ...options.slice(1)];
    } else {
        userReducers = options.reducers; 
        let {
            middlewares,
            initialState
        } = options;

        args = [combine(reducerRegistry.getReducers(), userReducers), initialState];
        if (Array.isArray(middlewares)) args.push(applyMiddleware(...middlewares));
    }

    // create Store directly;
    // cause the reducer may be attached at subpackages.
    let store = createStore.apply(null, args);
    reducerRegistry.setChangeListener((reducer)=>{
        store.replaceReducer(combine(reducer, userReducers));
    });

    let syncStore = function(){
        this.$$isCurrentPage = true;
        let data = mapState(this.mapState, this.$store.getState(), this.$$storeLastState, this);
        if (data != null) {
            let diffData = this.$$reduxDiff(data)
            this.setData(diffData)
        };
    }

    return (vm, type) => {
        switch (type) {
            case 'App':
                vm.$store = store;
                break;
            case 'Page':
                vm.$store = store;
                let { onLoad, onShow, onUnload, onHide } = vm;
                vm.onLoad = mountRedux(onLoad);
                vm.onShow = function (...args) {
                    syncStore.bind(this)();
                    if (onShow) onShow.apply(this, args);
                }
                vm.onHide = function (...args) {
                    this.$$isCurrentPage = false;
                    if (onHide) onHide.apply(this, args);
                }
                vm.onUnload = unmountRedux(onUnload);
                break;
            case 'Component':
                let {
                    created,
                    attached,
                    detached,
                    pageLifetimes
                } = vm;
                vm.pageLifetimes = pageLifetimes || {};
                let {show, hide} = vm.pageLifetimes;
                // auto sync store data to component.
                vm.pageLifetimes.show = function(args) {
                    syncStore.bind(this)();
                    if (show) show.apply(this, args);
                }
                vm.pageLifetimes.hide = function(args) {
                    this.$$isCurrentPage = false;
                    if (hide) hide.apply(this, args);
                }

                vm.created = function (...args) {
                    this.$store = store;
                    if (created) created.apply(this, args);
                }
                vm.attached = mountRedux(attached);
                vm.detached = unmountRedux(detached);
                break;
            default: 
                throw new Error('不合法的wxa组件类型');
        }
    };
}

export * from 'redux';

export {reducerRegistry};