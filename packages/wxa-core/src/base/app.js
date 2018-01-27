import mixin from './mixin';

const plugins = [];
let launch = function(instance) {
    let vm = instance;
    if (typeof instance === 'function') {
        vm = new instance();
    }

    if (vm.mixins && !!vm.mixins.length) {
        vm = mixin(vm);
    }

    // 复制methods
    if (vm.methods != null && typeof vm.methods === 'object') {
        Object.keys(vm.methods).forEach((key)=>{
            vm[key] = vm.methods[key];
        });
    }
    // 允许添加自定义方法
    plugins.forEach((plugin)=>{
        plugin.fn.call(null, plugin.options, 'App').call(null, vm);
    });

    App(vm);
};

let use = function(plugin, options) {
    plugins.push({
        fn: plugin,
        options,
    });
};

export default {
    launch,
    use,
};
