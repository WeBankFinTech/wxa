/// <reference path="../node_modules/miniprogram-api-typings/types/index.d.ts" />

import './polyfill/bind';
import debounce from 'lodash/debounce';
import mixin from './base/mixin';
import diff from './diff/diff';
import { setMaxRequest, setRequestExpiredTime } from './utils/fetch';
import { addNoPromiseApi } from './utils/wxapi';

// default component field
const notCopy = ['properties', 'data', 'methods', 'behaviors', 'created', 'attached', 'ready', 'moved', 'detached', 'relations', 'options', 'lifetimes', 'pageLifetimes', 'definitionFilter'];
/**
 * wxa core class function.
 * launchApp, launchPage, launchComponent.
 *
 * @class Wxa
 */
export class Wxa {

  public launch;
  public addNoPromiseApi;
  public setMaxRequest;
  public setRequestExpiredTime;
  public IS_DEBUG;
  private $$globalMixins;
  private $$pageMap;
  private $$plugins;

  constructor() {
    // pages map, store the vm object.
    this.$$pageMap = new Map();

    // plugins map, store all register plugins.
    this.$$plugins = [];

    // launcher map, launch app, page, component
    const launcherMap = new Map([['app', this.launchApp.bind(this)], ['page', this.launchPage.bind(this)], ['component', this.launchComponent.bind(this)]]);

    // launch API:
    // wxa.launch('App', class Main{})
    // wxa.launchPage(class Index{}, 'pages/index')
    // wxa.launch.component(class Popup{})
    this.launch =  (type, vm, pagePath) => {
      const launchType: string = type.toLowerCase();
      return launcherMap.get(launchType).call(null, vm, pagePath);
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

  public setDebugMode(val) {
    this.IS_DEBUG = !!val;
    if (this.IS_DEBUG) {
      console.warn('WXA is in Debug mode, please close debug mode in production.');
      console.info('wxa class: ', this);
    }
  }

  public launchApp(instance) {
    let vm = instance;

    vm = mixin(vm);

    // 复制methods
    if (vm.methods != null && typeof vm.methods === 'object') {
      Object.keys(vm.methods).forEach((key) => {
        vm[key] = vm.methods[key];
      });
    }
    // 允许添加自定义方法
    this.$$plugins.forEach((plugin) => {
      try {
        plugin.fn.call(null, vm, 'App');
      } catch (e) {
        console.error(e);
      }
    });

    App(vm);
  }

  public launchPage(instance, pagePath) {
    let vm = instance;

    vm = mixin(vm, this.$$globalMixins);

    vm.$go = debounce(function (e) {
      const { currentTarget: { dataset: { path, type } } } = e;
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

    vm.$diff = function (newData, cb) {
      const data = diff.bind(this)(newData);
      // console.log(data);
      this.setData(data, cb);
    };

    if (vm.methods != null && typeof vm.methods === 'object') {
      Object.keys(vm.methods).forEach((key) => {
        vm[key] = vm.methods[key];
      });
    }
    // 允许添加自定义方法
    this.$$plugins.forEach((plugin) => {
      plugin.fn.call(null, vm, 'Page');
    });

    if (!!pagePath) {
      const _pagePath = pagePath.replace(/^\//, '');
      this.$$pageMap.set(_pagePath, vm);
    }

    // console.log(vm);
    Page(vm);
  }

  public launchComponent(instance) {
    let vm = instance;

    vm = mixin(vm, this.$$globalMixins);

    vm.$diff = function (newData, cb) {
      const data = diff.bind(this)(newData);
      this.setData(data, cb);
    };

    // 允许添加自定义方法
    this.$$plugins.forEach((plugin) => {
      plugin.fn.call(null, vm, 'Component');
    });

    const methods = vm.methods || {};
    for (const key in vm) {
      if (notCopy.indexOf(key) === -1) {
        methods[key] = vm[key];
      }
    }

    const created = vm.created;
    vm.created = function (...args) {
      const comMethods = methods;
      for (const key in comMethods) {
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

  public mixin(obj) {
    if (obj == null) return;

    this.$$globalMixins.push(obj);
  }

  public use(plugin, options) {
    // initial options for plugin.
    const pluginFn = plugin.call(null, options);

    this.$$plugins.push({
      fn: pluginFn,
      options,
    });
  }
}

export const wxa = new Wxa();
