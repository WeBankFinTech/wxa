import promisify from './promisify';
import {eventbus} from './eventbus';
import {router} from './router';
import wxapi from './wxapi';
import {storage} from './storage';
// import wa from '../assets/libs/wa';
import debounce from './debounce';
import * as helpers from './helper';
import fetch from './fetch';

// class
function Eventbus(target) {
    target.prototype.eventbus = eventbus;
    return target;
}

// class
function GetApp(target) {
    target.prototype.app = getApp();
    return target;
}

// class
function Router(target) {
    target.prototype.router = router;
    return target;
}

// class Promisify
function Promisify(target) {
    target.prototype.promisify = promisify;

    return target;
}

// class logger
// function Logger(target) {
//     target.prototype.logger = console;

//     return target;
// }

// 挂载微信api
function Wxapi(target) {
    target.prototype.wxapi = wxapi;
    return target;
}

// storage
function Storage(target) {
    target.prototype.storage = storage;
    return target;
}

function Utils(target) {
    target.prototype.utils = {
        debounce,
        ...helpers,
    };
    return target;
}

function Fetch(target) {
    target.prototype.fetch = fetch;

    return target;
}

function Page(target) {
    Utils(target);
    Storage(target);
    Wxapi(target);
    Router(target);
    Eventbus(target);
    GetApp(target);
    // Logger(target);
    Fetch(target);

    return target;
}

function App(target) {
    Utils(target);
    Storage(target);
    Eventbus(target);
    Wxapi(target);
    // Logger(target);
    Fetch(target);

    return target;
}

// method
// function Method(target, key, descriptor) {
//     Object.defineProperty(target, key, descriptor);
// }

export {
    Page,
    App,
    GetApp,
    Storage,
    Wxapi,
    Promisify,
    Router,
    Eventbus,
    Fetch,
};

export * from 'core-decorators';
