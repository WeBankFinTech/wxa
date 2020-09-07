/* eslint-disable no-undef */
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

        // enable automatic embed app instance
        this.enableAppEmbed = true;

        this.__WXA_PLATFORM__ = void(0);
        this.platform = this.getWxaPlatform();
    }

    setDebugMode(val) {
        this.IS_DEBUG = !!val;
        if (this.IS_DEBUG) {
            console.warn('WXA is in Debug mode, please close debug mode in production.');
            console.info('wxa class: ', this);
        }
    }

    launchApp(instance) {
        let vm = instance;

        vm = mixin(vm);

        // 复制methods
        if (vm.methods != null && typeof vm.methods === 'object') {
            Object.keys(vm.methods).forEach((key)=>{
                vm[key] = vm.methods[key];
            });
        }
        // 允许添加自定义方法
        this.$$plugins.forEach((plugin)=>{
            try {
                plugin.fn.call(null, vm, 'App');
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
            if (this.$router) {
                this.$router[category](path);
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
            plugin.fn.call(null, vm, 'Page');
        });

        if (!!pagePath) {
            let _pagePath = pagePath.replace(/^\//, '');
            this.$$pageMap.set(_pagePath, vm);
        }

        // fallback for wxa1.0 and old wxa2 project.
        if (this.enableAppEmbed) {
            let onLoad = vm.onLoad;
            vm.onLoad = function(...args) {
                this.$app = getApp();

                onLoad && onLoad.apply(this, args);
            };
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
            plugin.fn.call(null, vm, 'Component');
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
        // initial options for plugin.
        let pluginFn = plugin.call(null, options);

        this.$$plugins.push({
            fn: pluginFn,
            options,
        });
    }

    disabledAppEmbed() {
        this.enableAppEmbed = false;
    }

    /**
     * @return {String}
     * return mini-program platform.
     */
    getWxaPlatform() {
        if (typeof this.__WXA_PLATFORM__ !== 'undefined') return this.__WXA_PLATFORM__;
        else if (typeof tt !== 'undefined') return 'tt';
        else return 'wechat';
    }
}

export const wxa = new Wxa();
