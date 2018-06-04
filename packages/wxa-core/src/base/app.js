import mixin from './mixin';

const plugins = [];
let launch = function(instance) {
    let vm = instance;
    if (typeof instance === 'function') {
        let obj = new instance();

        obj.methods = obj.methods || {};
        Object.getOwnPropertyNames(instance.prototype).forEach((key)=>{
            if (['constructor'].indexOf(key) === -1) {
                obj.methods[key] = instance.prototype[key];
            }
        });

        vm = obj;
    }

    vm = mixin(vm);

    // 复制methods
    if (vm.methods != null && typeof vm.methods === 'object') {
        Object.keys(vm.methods).forEach((key)=>{
            vm[key] = vm.methods[key];
        });
    }
    // 允许添加自定义方法
    plugins.forEach((plugin)=>{
        try {
            plugin.fn.call(null, plugin.options, 'App').call(null, vm, 'App');
        } catch (e) {
            console.error(e);
        }
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
