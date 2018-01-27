import promisify from './promisify';
import {eventbus} from './eventbus';
import {router} from './router';
import wxapi from './wxapi';
import {storage} from './storage';
// import wa from '../assets/libs/wa';
import debounce from './debounce';
import * as helpers from './helper';

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

// class Wa
function Logger(target) {
    target.prototype.logger = console;

    return target;
}

// 挂载微信api
function Wxapi(target) {
    target.prototype.wxapi = Object.assign({}, wxapi);
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

function Page(target) {
    target = Utils(target);
    target = Storage(target);
    target = Wxapi(target);
    target = Router(target);
    target = Eventbus(target);
    target = GetApp(target);
    target = Logger(target);

    return target;
}

function App(target) {
    target = Utils(target);
    target = Storage(target);
    target = Eventbus(target);
    target = Wxapi(target);
    target = Logger(target);

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
};
