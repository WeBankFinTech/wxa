import mapState from './mapState'
import {createStore, applyMiddleware} from 'redux'

let mountRedux = function(originMount){
    return function(...args) {
        this.unsubscribe = this.store.subscribe((...args)=>{
            let state = this.store.getState();
            let data = mapState(this.mapState, state);
            
            if(this.$isCurrentPage && data != null) this.setData(data);
        });
        if(originMount) originMount.apply(this, args);
    }
}

let unmountRedux = function(originUnmount) {
    return function(...args) {
        if(this.unsubscribe) this.unsubscribe();
        if(originUnmount) originUnmount.apply(this, args);
    }
}

export const wxaRedux = ({reducers, middlewares}, type)=>{
    return (vm)=>{
        if (type === 'App') {
            let args = [reducers];
            if(middlewares) args.push(applyMiddleware(...middlewares));
            vm.store = createStore.apply(null, args);
        } else if(type === 'Page'){
            if (vm.app == null) throw new Error('wxa-redux需要使用@GetApp修饰符');
            vm.store = vm.app.store;
            let {onLoad, onShow, onUnload, onHide} = vm;
            vm.onLoad = mountRedux(onLoad);
            vm.onShow = function(...args) {
                this.$isCurrentPage = true;
                let data = mapState(this.mapState, this.store.getState());
                if(data != null) this.setData(data);
                if(onShow) onShow.apply(this, args);
            }
            vm.onHide = function(...args) {
                this.$isCurrentPage = false;
                if(onHide) onHide.apply(this, args);
            }
            vm.onUnload = unmountRedux(onUnload);
        } else if(type === 'Component') {
            let {created, attached, detached} = vm;
            vm.store = vm.app.store;
            vm.attached = mountRedux(attached);
            vm.detached = unmountRedux(detached);
        }
    };
}

export * from 'redux';