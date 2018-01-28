import mapState from './mapState'
import {createStore, applyMiddleware} from 'redux'

export const wxaRedux = ({reducers, middlewares}, type)=>{
    return (vm)=>{
        if (type === 'App') {
            vm.store = createStore(reducers, applyMiddleware(...middlewares));
        } else {
            if (vm.app == null) throw new Error('wxa-redux需要使用@GetApp修饰符');
            vm.store = vm.app.store;
            let {onLoad, onShow, onUnload, onHide} = vm;
            vm.onLoad = function(...args) {
                this.unsubscribe = this.store.subscribe((...args)=>{
                    let state = this.store.getState();
                    let data = mapState(this.mapState, state);
                    
                    if(this.$isCurrentPage && data != null) this.setData(data);
                });
                onLoad.apply(this, args);
            }
            vm.onShow = function(...args) {
                this.$isCurrentPage = true;
                let data = mapState(this.mapState, state);
                if(data != null) this.setData(data);
                onShow.apply(this, args);
            }
            vm.onHide = function(...args) {
                this.$isCurrentPage = false;
                onHide.apply(this, args);
            }
            vm.onUnload = function(...args) {
                if(this.unsubscribe) this.unsubscribe();
                onUnload.apply(this, args);
            }
        }
    };
}

export * from 'redux';