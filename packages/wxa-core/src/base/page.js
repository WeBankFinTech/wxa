// import {Eventbus, Promisify} from '../utils/decorators';
import debounce from '../utils/debounce';
import mixin from './mixin';
// const merge = require('../utils/deep-merge');
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
            this.router[category](path);
        }, 250);
    })();
    vm.onShareAppMessage = vm.onShareAppMessage || function() {
        let pages = getCurrentPages();
        return {
            success: function() {
                try {
                    vm.logger.clickStat('share', pages[pages.length-1].route);
                } catch (e) {
                    console.error(e);
                }
            },
        };
    };

    if (vm.mixins && !!vm.mixins.length) {
        vm = mixin(vm);
    }

    if (vm.methods != null && typeof vm.methods === 'object') {
        Object.keys(vm.methods).forEach((key)=>{
            vm[key] = vm.methods[key];
        });
    }

    // 允许添加自定义方法
    plugins.forEach((plugin)=>{
        plugin.fn.call(null, plugin.options, 'Page').call(null, vm);
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
