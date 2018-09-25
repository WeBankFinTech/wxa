import app from './base/app';
import page from './base/page';
import component from './base/component';
import {default as wxapiFn, addNoPromiseApi} from './utils/wxapi';
import {storage} from './utils/storage';
import {router} from './utils/router';
import promisify from './utils/promisify';
import {eventbus} from './utils/eventbus';

import debounce from 'lodash/debounce';
import throttle from 'lodash/throttle';
import once from 'lodash/once';
import delay from 'lodash/delay';

import message from './utils/message';
import toast from './utils/toast';

import {
    default as fetch,
    setMaxRequest,
    setRequestExpiredTime,
} from './utils/fetch';

/**
 * wxa core class function.
 * launchApp, launchPage, launchComponent.
 *
 * @class Wxa
 */
class Wxa {
    constructor() {
        // pages map, store the vm object.
        this.$$pageMap = new Map();

        // plugins map, store all register plugins.
        this.$$plugins = [];

        // launcher map, launch app, page, component
        let launcherMap = new Map([['app', app.launch], ['page', page.launch], ['component', component.launch]]);

        // launch API:
        // wxa.launch('App', class Main{})
        // wxa.launchPage(class Index{}, 'pages/index')
        // wxa.launch.component(class Popup{})
        this.launch = function(type, vm, pagePath) {
            let _type = type.toLowerCase();
            return launcherMap.get(_type).call(null, vm, pagePath);
        };
        this.launch.app = this.launchApp;
        this.launch.page = this.launchPage;
        this.launch.component = this.launchComponent;

        // global configuration function
        // addNoPromiseApi to prevent promisify wrongly.
        this.addNoPromiseApi = addNoPromiseApi;

        // set up fetch queue max concurrency request.
        this.setMaxRequest = setMaxRequest;
        // set up fetch cached request expired time, default: 500ms
        // which mean you can't post same request in 500ms multi time.
        this.setRequestExpiredTime = setRequestExpiredTime;
    }
    launchApp(instance) {
        return app.launch(instance);
    }
    launchPage(instance, pagePath) {
        return page.launch(instance, pagePath);
    }
    launchComponent(instance) {
        return component.launch(instance);
    }
    use(plugin, options) {
        this.$$plugins.push({
            fn: plugin,
            options,
        });
    }
}

export const wxa = new Wxa();
export * from './decorators/index';
export const wxapi = wxapiFn(wx);
export {
    storage,
    router,
    promisify,
    eventbus,
    fetch,

    debounce,
    throttle,
    once,
    delay,

    message,
    toast,
};
