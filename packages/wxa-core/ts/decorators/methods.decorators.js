import once from 'lodash/once';
import delay from 'lodash/delay';
import debounce from 'lodash/debounce';
import throttle from 'lodash/throttle';

/**
 * mark methods to deprecate. while developer call it, print a warning text to console
 *
 * @param {any} methodDescriptor
 *
 * @return {any}
 */
function Deprecate(methodDescriptor) {
    let {descriptor, key} = methodDescriptor;

    let fn = descriptor.value;

    descriptor.value = function(...args) {
        console.warn(`DEPRECATE: [${key}] This function will be removed in future versions.`);
        return fn.apply(this, args);
    };

    return {
        ...methodDescriptor,
        descriptor,
    };
}
/**
 * record timing that function consume.
 *
 * @param {any} name
 * @param {any} rest
 * @return {any}
 */
function Time(name, ...rest) {
    let h = (methodDescriptor)=>{
        let {key, descriptor} = methodDescriptor;

        let fn = descriptor.value;
        let timer;

        let timeStart;
        let timeEnd;
        if (console != null && typeof console.time === 'function') {
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

        return {
            ...methodDescriptor,
            descriptor,
        };
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
 * @param {number} [delay=300]
 * @param {Object} [options={leading: true, trailing: false}]
 * @return {any}
 */
function Debounce(delay=300, options={leading: true, trailing: false}) {
    let d = (methodDescriptor, args)=>{
        let {descriptor} = methodDescriptor;

        let fn = descriptor.value;
        descriptor.value = debounce(fn, ...args);

        return {
            ...methodDescriptor,
            descriptor,
        };
    };

    if (typeof delay === 'object') {
        d(delay, [300, {leading: true, trailing: false}]);
    } else {
        return (m)=>d(m, [delay, options]);
    }
}

function Throttle(first=1000, options={}) {
    let d = (methodDescriptor, args)=>{
        let {descriptor} = methodDescriptor;

        let fn = descriptor.value;
        // console.log(...args);
        descriptor.value = throttle(fn, ...args);

        return {
            ...methodDescriptor,
            descriptor,
        };
    };

    if (typeof first === 'object') {
        d(first, [1000, {leading: true, trailing: false}]);
    } else {
        return (m)=>d(m, [first, options]);
    }
}

function Once(methodDescriptor) {
    let {descriptor} = methodDescriptor;

    let fn = descriptor.value;
    descriptor.value = once(fn);

    return {
        ...methodDescriptor,
        descriptor,
    };
}

function Delay(wait) {
    return function(methodDescriptor) {
        let {descriptor} = methodDescriptor;
        let fn = descriptor.value;

        descriptor.value = function(...args) {
            return delay(fn, wait, ...args);
        };

        return {
            ...methodDescriptor,
            descriptor,
        };
    };
}
/**
 * Lock function util fn finish process
 *
 * @param {Object} methodDescriptor
 *
 * @return {Function}
 */
function Lock(methodDescriptor) {
    let {descriptor} = methodDescriptor;
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
                debugger;
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

    return {
        ...methodDescriptor,
        descriptor,
    };
}

/**
 * specify if show loading while execute the function.
 *
 * @param {String} tips
 * @param {String} type
 *
 * @return {Function}
 */
export default function Loading(tips='Loading', type='loading') {
    return function(methodDescriptor) {
        let {descriptor} = methodDescriptor;

        let map = {
            loading: {
                show: wx.showLoading,
                hide: wx.hideLoading,
            },
            bar: {
                show: wx.showNavigationBarLoading,
                hide: wx.hideNavigationBarLoading,
            },
        };

        let loader = map[type];
        let fn = descriptor.value;

        descriptor.value = function(...args) {
            loader.show({title: tips, mask: true});

            let ret = fn.call(this, ...args);

            if (ret && ret.then) {
                ret.then((succ)=>{
                    loader.hide();
                    return succ;
                }, (fail)=>{
                    loader.hide();
                    return Promise.reject(fail);
                });
            } else {
                loader.hide();
            }
        };

        return {
            ...methodDescriptor,
            descriptor,
        };
    };
}


export {
    Lock,
    Loading,
    Delay,
    Once,
    Throttle,
    Debounce,
    Deprecate,
    Time,
};
