import mapState from './mapState'
import {
    createStore,
    applyMiddleware
} from 'redux'

let mountRedux = function (originMount) {
    return function (...args) {
        if(this.store) {
            this.unsubscribe = this.store.subscribe((...args) => {
                if(this.$isCurrentPage) {
                    let newState = this.store.getState();
                    let data = mapState(this.mapState, newState, this.data);
    
                    if (data !== null) {
                        this.setData(data);
                    }
                }
            });
        }
        if (originMount) originMount.apply(this, args);
    }
}

let unmountRedux = function (originUnmount) {
    return function (...args) {
        if (this.unsubscribe) {
            this.unsubscribe();
            this.unsubscribe = null;
        }
        if (originUnmount) originUnmount.apply(this, args);
    }
}

export const wxaRedux = ({
    reducers,
    middlewares
}, type) => {
    return (vm) => {
        if (type === 'App') {
            let args = [reducers];
            if (middlewares) args.push(applyMiddleware(...middlewares));
            vm.store = createStore.apply(null, args);
        } else if (type === 'Page') {
            if (vm.app == null) throw new Error('wxa-redux需要使用@GetApp修饰符');
            vm.store = vm.app.store;
            let {
                onLoad,
                onShow,
                onUnload,
                onHide
            } = vm;
            vm.onLoad = mountRedux(onLoad);
            vm.onShow = function (...args) {
                this.$isCurrentPage = true;
                let data = mapState(this.mapState, this.store.getState(), this.data);
                if (data != null) this.setData(data);
                if (onShow) onShow.apply(this, args);
            }
            vm.onHide = function (...args) {
                this.$isCurrentPage = false;
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
                if (this.app == null) {
                    console.warn('组件未注入app实例，无法使用Redux')
                } else {
                    this.store = this.app.store;
                    if (created) created.apply(this, args);
                }
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