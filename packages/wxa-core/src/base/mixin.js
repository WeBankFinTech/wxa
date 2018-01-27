import merge from '../utils/deep-merge';
export default function mixin(vm) {
    let mixins = vm.mixins;
    delete vm.mixins;

    mixins.push(vm);
    // copy methods and data;
    let candidate = mixins.reduce((ret, mixin) => {
        Object.keys(mixin.methods).forEach((key) => {
            ret.methods[key] = mixin.methods[key];
        });
        ret.data = merge(ret.data, mixin.data);
        return ret;
    }, {
        methods: {},
        data: {},
    });
    // copy lifecycle hooks
    const hooksName = ['onLaunch', 'onShow', 'onHide', 'onError', 'onLoad', 'onReady', 'onShow', 'onHide', 'onUnload', 'onPullDownRefresh', 'onReachBottom', 'onShareAppMessage', 'onPageScroll', 'onTabItemTap',
    ];
    let hooks = mixins.reduce((ret, mixin) => {
        hooksName.forEach((hook)=>{
            if (mixin[hook]) {
                Array.isArray(ret[hook]) ?
                    ret[hook].push(mixin[hook]) :
                    (ret[hook] = [mixin[hook]]);
            }
        });
        return ret;
    }, {});

    vm.data = candidate.data;
    vm.methods = candidate.methods;
    Object.keys(hooks).forEach((name)=>{
        vm[name] = function(...opts) {
            let self = this;
            hooks[name].forEach((fn)=>fn.apply(self, opts));
        };
    });

    return vm;
}
