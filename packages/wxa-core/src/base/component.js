import mixin from './mixin';

const plugins = [];
const notCopy = ['properties', 'data', 'methods', 'behaviors', 'created', 'attached', 'ready', 'moved', 'detached', 'relations', 'options'];
let launch = function(instance) {
    let vm = instance;
    if (typeof instance === 'function') {
        vm = new instance();
    }

    // 微信自定义组件支持使用behaviors，不需要mixins
    // 自定义组件支持methods方式定义组件，不需要迁移methods

    // 允许添加自定义方法
    plugins.forEach((plugin)=>{
        plugin.fn.call(null, plugin.options, 'Component').call(null, vm);
    });

    let methods = vm.methods || {};
    for (let key in vm) {
        if (notCopy.indexOf(key) === -1) {
            methods[key] = vm[key];
        }
    }

    let created = vm.created;
    vm.created = function(...args) {
        let comMethods = methods;
        for (let key in comMethods) {
            if (comMethods.hasOwnProperty(key)) {
                if (typeof comMethods[key] === 'function') {
                    this[key] = comMethods[key].bind(this);
                } else {
                    this[key] = comMethods[key];
                }
            }
        }
        if (created) created.apply(this, args);
    };

    Component(vm);
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
