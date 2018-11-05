import './polyfill/bind';

import debounce from 'lodash/debounce';
import diff from './diff/diff';
import mixin from './base/mixin';
import {addNoPromiseApi} from './utils/wxapi';
import {
    setMaxRequest,
    setRequestExpiredTime,
} from './utils/fetch';

// default component field
const notCopy = ['properties', 'data', 'methods', 'behaviors', 'created', 'attached', 'ready', 'moved', 'detached', 'relations', 'options', 'lifetimes', 'pageLifetimes', 'definitionFilter'];
/**
 * wxa core class function.
 * launchApp, launchPage, launchComponent.
 *
 * @class Wxa
 */
export class Wxa {
    constructor() {
        // pages map, store the vm object.
        this.$$pageMap = new Map();

        // plugins map, store all register plugins.
        this.$$plugins = [];

        // launcher map, launch app, page, component
        let launcherMap = new Map([['app', this.launchApp.bind(this)], ['page', this.launchPage.bind(this)], ['component', this.launchComponent.bind(this)]]);

        // launch API:
        // wxa.launch('App', class Main{})
        // wxa.launchPage(class Index{}, 'pages/index')
        // wxa.launch.component(class Popup{})
        this.launch = function(type, vm, pagePath) {
            let _type = type.toLowerCase();
            return launcherMap.get(_type).call(null, vm, pagePath);
        };
        this.launch.app = this.launchApp.bind(this);
        this.launch.page = this.launchPage.bind(this);
        this.launch.component = this.launchComponent.bind(this);

        // global configuration function
        // addNoPromiseApi to prevent promisify wrongly.
        this.addNoPromiseApi = addNoPromiseApi;

        // set up fetch queue max concurrency request.
        this.setMaxRequest = setMaxRequest;
        // set up fetch cached request expired time, default: 500ms
        // which mean you can't post same request in 500ms multi time.
        this.setRequestExpiredTime = setRequestExpiredTime;

        // debug mode
        // use console to print debug message
        this.IS_DEBUG = false;

        // globalMixins
        // every Page, Component will receive these guys.
        this.$$globalMixins = [];
    }
    setDebugMode(val) {
        this.IS_DEBUG = !!val;
        if (this.IS_DEBUG) {
            console.info(this);
            console.warn('WXA is in Debug mode, please close debug mode in production.');
        }
    }
    launchApp(instance) {
        let vm = instance;

        vm = mixin(vm);

        // 复制methods
        if (vm.methods != null && typeof vm.methods === 'object') {
            // console.log(vm);
            Object.keys(vm.methods).forEach((key)=>{
                console.log(key, Object.getOwnPropertyDescriptor(vm.__proto__, key));
                vm[key] = vm.methods[key];
            });
        }
        // 允许添加自定义方法
        this.$$plugins.forEach((plugin)=>{
            try {
                plugin.fn.call(null, plugin.options, 'App').call(null, vm, 'App');
            } catch (e) {
                console.error(e);
            }
        });

        App(vm);
    }
    launchPage(instance, pagePath) {
        let vm = instance;

        vm = mixin(vm, this.$$globalMixins);

        vm.$go = debounce(function(e) {
            let {currentTarget: {dataset: {path, type}}} = e;
            let category = 'push';
            if (type) category = type;
            if (this.router) {
                this.router[category](path);
            } else {
                console.warn('router未挂载');
            }
        }, 300, {
            leading: true,
            trailing: false,
        });

        vm.$diff = function(newData, cb) {
            let data = diff.bind(this)(newData);
            // console.log(data);
            this.setData(data, cb);
        };

        if (vm.methods != null && typeof vm.methods === 'object') {
            Object.keys(vm.methods).forEach((key)=>{
                vm[key] = vm.methods[key];
            });
        }
        // 允许添加自定义方法
        this.$$plugins.forEach((plugin)=>{
            plugin.fn.call(null, plugin.options, 'Page').call(null, vm, 'Page');
        });

        if (!!pagePath) {
            let _pagePath = pagePath.replace(/^\//, '');
            wxa.$$pageMap.set(_pagePath, vm);
        }

        Page(vm);
    }
    launchComponent(instance) {
        let vm = instance;

        vm = mixin(vm, this.$$globalMixins);

        vm.$diff = function(newData, cb) {
            let data = diff.bind(this)(newData);
            this.setData(data, cb);
        };

        // 允许添加自定义方法
        this.$$plugins.forEach((plugin)=>{
            plugin.fn.call(null, plugin.options, 'Component').call(null, vm, 'Component');
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
    }
    mixin(obj) {
        if (obj == null) return;

        this.$$globalMixins.push(obj);
    }
    use(plugin, options) {
        this.$$plugins.push({
            fn: plugin,
            options,
        });
    }
}

export const wxa = new Wxa();
