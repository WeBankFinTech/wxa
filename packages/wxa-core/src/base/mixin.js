import merge from '../utils/deep-merge';

import {hooksName} from './hook';

let getPropotypeOf = Object.getPrototypeOf || ((obj)=>obj.__proto__);

// trace prototype to copy method for extends.
let tracePrototypeMethods = (vm)=>{
    let result = {};

    Object.getOwnPropertyNames(vm).forEach((key)=>{
        // wxa private methods that prefix with $ should allways not to copy.
        // also, the wxa hooks, un-writable methos and mixins shouldn't too.
        if (
            !~['constructor', 'mixins'].indexOf(key) &&
            !/^$/.test(key) &&
            hooksName.indexOf(key) === -1
        ) {
            result[key] = vm[key];
        }
    });

    const proto = getPropotypeOf(vm);

    if (proto && proto.constructor !== Object) {
        return {
            ...tracePrototypeMethods(proto),
            ...result,
        };
    } else {
        return result;
    }
};

let copyMethodsFromClass = (vm)=>{
    if (typeof vm === 'function') {
        // class
        let obj = new vm();

        obj.methods = obj.methods || {};

        const tracedMethods = tracePrototypeMethods(vm.prototype);

        obj.methods = {
            ...obj.methods,
            ...tracedMethods,
        };
        vm = obj;
    } else if (typeof vm !== 'object') {
        vm = {};
    }

    return vm;
};

export default function mixin(vm, globalMixin=[]) {
    if (vm == null) return {};

    vm = copyMethodsFromClass(vm);

    if (typeof vm !== 'object') return {};

    // mixins object is allow to put on prototype object. so here may not delete it.
    let mixins = vm.mixins || [];
    delete vm.mixins;

    mixins = mixins.concat(globalMixin);
    mixins.push(vm);
    // nested mixins copy
    mixins = mixins.map((item)=>{
        // never call handle vm again, or may cost endless loop
        if (item == null || item === vm) return item;

        if (item.mixins) return mixin(item);

        return copyMethodsFromClass(item);
    });
    // copy methods, data and hooks;
    let candidate = mixins.reduce((ret, mixin) => {
        if (mixin == null || typeof mixin !== 'object') {
            return ret;
        }

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
         * ~~do not copy onShareAppMessage~~
         * try to merge onShareAppMessage function.
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
    // console.log(candidate.hooks);
    Object.keys(candidate.hooks).forEach((name)=>{
        // console.log(name);
        if (name === 'onShareAppMessage') {
            vm[name] = function(...opts) {
                let self = this;

                let ret;
                candidate.hooks[name].forEach((fn)=>{
                    ret = fn.apply(self, opts);
                });
                // onShareAppMessage according to return value to custorm share message.
                return ret;
            };
        } else {
            vm[name] = function(...opts) {
                let self = this;
                let ret;
                candidate.hooks[name].forEach((fn)=>{
                    ret = fn.apply(self, opts);
                });
                return ret;
            };
        }
    });

    return vm;
}
