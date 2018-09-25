import debounce from 'lodash/debounce';
import mixin from './mixin';
import {hooksName} from './hook';
import {wxa} from '../wxa';

let launch = function(instance, pagePath) {
    let vm = instance;

    vm = mixin(vm);

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
        }, 200, {
            leading: true,
            trailing: false,
        });
    })();

    if (vm.methods != null && typeof vm.methods === 'object') {
        Object.keys(vm.methods).forEach((key)=>{
            vm[key] = vm.methods[key];
        });
    }
    // 允许添加自定义方法
    wxa.$$plugins.forEach((plugin)=>{
        plugin.fn.call(null, plugin.options, 'Page').call(null, vm, 'Page');
    });

    let _pagePath = pagePath.replace(/^\//, '');
    wxa.$$pageMap.set(_pagePath, vm);

    console.log('====', vm);
    Page(vm);
};

export default {
    launch,
};
