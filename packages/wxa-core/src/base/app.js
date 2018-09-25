import mixin from './mixin';
import {hooksName} from './hook';

const plugins = [];
let launch = function(instance) {
    let vm = instance;

    vm = mixin(vm);

    // 复制methods
    if (vm.methods != null && typeof vm.methods === 'object') {
        console.log(vm);
        Object.keys(vm.methods).forEach((key)=>{
            console.log(key, Object.getOwnPropertyDescriptor(vm.__proto__, key));
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

export default {
    launch,
};
