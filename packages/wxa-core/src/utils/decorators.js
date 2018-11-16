import promisify from './promisify';
import {eventbus} from './eventbus';
import {router} from './router';
import wxapi from './wxapi';
import {storage} from './storage';
import debounce from 'lodash/debounce';
import throttle from 'lodash/throttle';
import once from 'lodash/once';
import delay from 'lodash/delay';
import * as helpers from './helpers';
import fetch from './fetch';
import mixin from '../base/mixin';

let methodDescriptorGenerator = (name, fn, placement='prototype')=>{
    return {
        [Symbol('Descriptor')]: 'Descriptor',
        key: name,
        kind: 'method',
        placement,
        descriptor: {
            value: fn,
            enumerable: true,
            writeable: false,
            configurable: false,
        },
    };
};

let classFactory = (name, fn)=>{
    return function(classDescriptor) {
        let {elements} = classDescriptor;

        return {
            elements: elements.concat([methodDescriptorGenerator(name, fn)]),
        };
    };
};

// Class Decorators.
const Eventbus = classFactory('eventbus', eventbus);
const GetApp = classFactory('app', getApp());
const Router = classFactory('router', router);
const Wxapi = classFactory('wxapi', wxapi(wx));
const Storage = classFactory('storage', storage);
const Utils = classFactory('utils', {
    debounce,
    promisify,
    throttle,
    ...helpers,
});
const Fetch = classFactory('fetch', fetch);
const Mixins = (...args)=>classFactory('mixins', [mixin({mixins: args})]);

// Page and App level class Decorators.
const Page = (classDescriptor)=>{
    let elements = [];
    elements = elements.concat(
        Utils(classDescriptor).elements,
        Storage(classDescriptor).elements,
        Wxapi(classDescriptor).elements,
        Router(classDescriptor).elements,
        Eventbus(classDescriptor).elements,
        GetApp(classDescriptor).elements,
        Fetch(classDescriptor).elements
    );

    return {
        elements,
    };
};

const App = (classDescriptor)=> {
    let elements = [];
    elements = elements.concat(
        Utils(classDescriptor),
        Storage(classDescriptor),
        Eventbus(classDescriptor),
        Wxapi(classDescriptor),
        Router(classDescriptor),
        Fetch(classDescriptor),
    );

    return {elements};
};

export {
    Page,
    App,
    GetApp,
    Storage,
    Wxapi,
    Router,
    Eventbus,
    Fetch,
    Utils,
    Mixins,
};
/**
 * mark methods to deprecate. while developer call it, print a warning text to console
 *
 * @param {any} target
 * @param {any} key
 * @param {any} descriptor
 *
 * @return {any}
 */
function Deprecate(target, key, descriptor) {
    let fn = descriptor.value;

    descriptor.value = function(...args) {
        console.warn(`DEPRECATE: [${key}] This function will be removed in future versions.`);
        return fn.apply(this, args);
    };

    return descriptor;
}
/**
 * record timing that function consume.
 *
 * @param {any} name
 * @param {any} rest
 * @return {any}
 */
function Time(name, ...rest) {
    let h = (target, key, descriptor)=>{
        let fn = descriptor.value;
        let timer;

        let timeStart;
        let timeEnd;
        if (console.time == null) {
            timeStart = console.time;
            timeEnd = console.timeEnd;
        } else {
            timeStart = ()=>{
                timer = Date.now();
            };

            timeEnd = (name)=>{
                let abstime = Date.now() - timer;

                console.log(name, '：', abstime);
            };
        }

        descriptor.value = function(...args) {
            timeStart(name || key);
            let r = fn.apply(this, args);

            if (r && typeof r.then === 'function') {
                return r.then((succ)=>{
                    timeEnd(name || key);
                    return Promise.resolve(succ);
                }, (fail)=>{
                    timeEnd(name || key);
                    return Promise.reject(fail);
                });
            } else {
                timeEnd(name || key);
                return r;
            }
        };

        return descriptor;
    };

    if (typeof name === 'string') {
        return h;
    } else {
        let args = [name, ...rest];
        name = void(0);
        h(...args);
    }
}
/**
 * debounce function with delay.
 * @param {number} [delay=100]
 * @param {Object} [options={}]
 * @return {any}
 */
function Debounce(delay=100, options={}) {
    return function(target, key, descriptor) {
        let fn = descriptor.value;

        descriptor.value = debounce(fn, delay, options);

        return descriptor;
    };
}

function Throttle(wait=1000, options={}) {
    return function(target, key, descriptor) {
        let fn = descriptor.value;

        descriptor.value = throttle(fn, wait, options);

        return descriptor;
    };
}

function Once(target, name, descriptor) {
    let fn = descriptor.value;

    descriptor.value = once(fn);

    return descriptor;
}

function Delay(wait) {
    return function(target, name, descriptor) {
        let fn = descriptor.value;

        descriptor.value = function(...args) {
            return delay(fn, wait, ...args);
        };

        return descriptor;
    };
}
/**
 * Lock function util fn finish process
 *
 * @param {any} target
 * @param {any} name
 * @param {any} descriptor
 *
 * @return {any}
 */
function Lock(target, name, descriptor) {
    let fn = descriptor.value;
    let $$LockIsDoing = false;

    let reset = ()=>$$LockIsDoing=false;
    descriptor.value = function(...args) {
        if ($$LockIsDoing) return;
        $$LockIsDoing = true;

        let ret = fn.apply(this, args);

        if (ret && ret.then) {
            // is promise
            return ret.then((succ)=>{
                reset();
                return Promise.resolve(succ);
            }, (fail)=>{
                reset();
                return Promise.reject(fail);
            });
        } else {
            reset();
            return ret;
        }
    };

    return descriptor;
}

export {
    Lock,
    Delay,
    Once,
    Throttle,
    Debounce,
    Deprecate,
    Time,
};

