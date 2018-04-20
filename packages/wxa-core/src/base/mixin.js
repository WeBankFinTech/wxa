import merge from '../utils/deep-merge';

const hooksName = ['onLaunch', 'onHide', 'onError', 'onLoad', 'onReady', 'onShow', 'onUnload', 'onPullDownRefresh', 'onReachBottom', 'onPageScroll', 'onTabItemTap', 'onPageNotFound'];

export default function mixin(vm) {
    let mixins = vm.mixins || [];
    delete vm.mixins;

    mixins.push(vm);
    // nested mixins copy
    mixins = mixins.map((item)=>{
        return item.mixins ? mixin(item) : item;
    });
    // copy methods , data and hooks;
    let candidate = mixins.reduce((ret, mixin) => {
        /**
         * copy object's methods
         */
        if (mixin.methods) {
            Object.keys(mixin.methods).forEach((key) => {
                ret.methods[key] = mixin.methods[key];
            });
        }
        /**
         * copy data
         */
        if (typeof mixin.data === 'object' && mixin.data != null) {
            ret.data = merge(ret.data, mixin.data);
        }
        /**
         * copy lifecycle hooks
         * do not copy onShareAppMessage
         */
        hooksName.forEach((name)=>{
            if (mixin[name]) {
                Array.isArray(ret.hooks[name]) ?
                    ret.hooks[name].push(mixin[name]) :
                    (ret.hooks[name] = [mixin[name]]);
            }
        });

        return ret;
    }, {
        methods: {},
        data: {},
        hooks: {},
    });

    vm.data = candidate.data;
    vm.methods = candidate.methods;
    Object.keys(candidate.hooks).forEach((name)=>{
        vm[name] = function(...opts) {
            let self = this;
            candidate.hooks[name].forEach((fn)=>fn.apply(self, opts));
        };
    });

    return vm;
}
