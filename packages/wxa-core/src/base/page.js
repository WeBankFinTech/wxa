import debounce from '../utils/debounce';
import mixin from './mixin';

const plugins = [];
let launch = function(instance) {
    let vm = instance;
    if (typeof instance === 'function') {
        vm = new instance();
    }
    vm.$go = (()=>{
        return debounce(function(e) {
            let {currentTarget: {dataset: {path, type}}} = e;
            let category = 'push';
            if (type) category = type;
            if (this.router) {
                this.router[category](path);
            } else {
                console.warn('router未挂载');
            }
        }, 220);
    })();
    if (vm.onShareAppMessage !== false) {
        vm.onShareAppMessage = vm.onShareAppMessage || function() {
            return {};
        };
    }

    vm = mixin(vm);

    if (vm.methods != null && typeof vm.methods === 'object') {
        Object.keys(vm.methods).forEach((key)=>{
            vm[key] = vm.methods[key];
        });
    }

    // 允许添加自定义方法
    plugins.forEach((plugin)=>{
        plugin.fn.call(null, plugin.options, 'Page').call(null, vm, 'Page');
    });

    Page(vm);
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
