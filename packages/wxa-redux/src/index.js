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
            this.$unsubscribe = this.$store.subscribe((...args) => {
                // Object updated && page is showing
                if(this.$$isCurrentPage) {
                    let newState = this.$store.getState();
                    let source = this.$$storeLastState;
                    let data = mapState(this.mapState, newState, source);
    
                    if (data !== null) {
                        // 有效state
                        this.$$storeLastState = newState;
                        let diffData = this.$$reduxDiff(data);
                        console.log('diff data ', diffData)
                        this.setData(diffData);
                    }
                }
            });
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

export const wxaRedux = ({
    reducers,
    middlewares
}={}) => {
    return (vm, type) => {
        if (type === 'App') {
            let args = [reducers];
            if (middlewares) args.push(applyMiddleware(...middlewares));
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
                let data = mapState(this.mapState, this.$store.getState(), this.$$storeLastState);
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
            vm.$isCurrentPage = true;
            vm.attached = mountRedux(attached);
            vm.detached = unmountRedux(detached);
        } else {
            throw new Error('不合法的wxa组件类型');
        }
    };
}

export * from 'redux';