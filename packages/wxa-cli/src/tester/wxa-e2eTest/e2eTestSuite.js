/* eslint-disable no-invalid-this */
/* eslint-disable no-undef */


const IDKEY = '_wxatestuniqueid';
const EVENTMAPKEY = '_wxatesteventmap';
let lastEventTime = {};
let state = {
    record: [],
    recording: false,
    apiRecord: new Map(),
    recordMode: false
};

// 获取eventMap中对应事件方法
function getEventFunc(eventType, eventMap) {
    // eventMap格式 tap:$go|longpress:$press
    let reg = new RegExp(`${eventType}:([^|]+)`);
    let result = eventMap.match(reg);
    if (result && result[1]) {
        return result [1];
    }
    return null;
}
// 判断是否需要记录操作
const shouldRecord = function(type, ...args) {
    let e = args[0];
    // 点击开始录制按钮后，才记录
    if (!state.recording) {
        return false;
    }
    // change且autoplay，不记录
    if (type === 'change' && e.detail.source === 'autoplay') {
        return false;
    }
    // 当前页面的操作才记录
    let currentPages = getCurrentPages();
    if (currentPages[currentPages.length - 1].__wxWebviewId__ !== this.__wxWebviewId__){
        return false;
    }
    if (e.target.dataset.e2ebtn === 'true') {
        return false;
    }
    let target = e.target.dataset[IDKEY] ? e.target : e.currentTarget;
    let id = target.dataset[IDKEY];
    // 已经记录过相同timestamp的事件，说明是冒泡的，不再记录
    if (lastEventTime[type] && lastEventTime[type].id === id && lastEventTime[type].timeStamp === e.timeStamp) {
        return false;
    }
    lastEventTime[type] = {};
    lastEventTime[type].timeStamp = e.timeStamp;
    lastEventTime[type].id = id;
    return true;
}

// 增加一条操作记录
const addRecord = function(type, ...args) {
    let e = args[0];
    let target = e.target.dataset[IDKEY] ? e.target : e.currentTarget;
    let id = target.dataset[IDKEY];
    // 先判断是否需要记录
    if (shouldRecord.bind(this)(type, ...args)) {
        let pages = getCurrentPages();
        state.record.push({
            action: {
                ...e,
                page: pages[pages.length - 1].route,
                event: type,
                id,
                timeStamp: +new Date()
            }
        });
        console.log('e2eRecord:', e)
    }

    // 调用eventMap中原方法
    let eventFunc = getEventFunc(type, e.currentTarget.dataset[EVENTMAPKEY]);
    if (!eventFunc) {
        console.warn(`wxa e2eTest, event "${type}" is lost`);
        return;
    }
    if (!this[eventFunc] || typeof this[eventFunc] !== 'function') {
        console.warn(`Component "${this.is}" does not have a method "${eventFunc}" to handle event "${type}". `);
        return;
    }
    this[eventFunc](...args);
};

const wrapEvent = {
    $$e2e_tap(...args) {
        addRecord.bind(this)('tap', ...args);
    },
    $$e2e_longpress(...args) {
        addRecord.bind(this)('longpress', ...args);
    },
    $$e2e_change(...args) {
        addRecord.bind(this)('change', ...args);
    },
    $$e2e_input(...args) {
        // input事件 自动化测试不支持，回放要用callMethod
        addRecord.bind(this)('input', ...args);
    },
    $$e2e_touchstart(...args) {
        // input事件 自动化测试不支持，回放要用callMethod
        addRecord.bind(this)('touchstart', ...args);
    },
    $$e2e_touchmove(...args) {
        // input事件 自动化测试不支持，回放要用callMethod
        addRecord.bind(this)('touchmove', ...args);
    },
    $$e2e_touchend(...args) {
        // input事件 自动化测试不支持，回放要用callMethod
        addRecord.bind(this)('touchend', ...args);
    },
};

// 将替换事件挂载到vm上
const mountStateAndWrapEvent = (vm) => {
    for (let key in wrapEvent) {
        vm[key] = wrapEvent[key];
    }
    vm.$$e2e_state = state;
};

let $$testSuitePlugin = (options) => {
    // vm是当前实例，type为实例类型
    return (vm, type)=>{
        // 劫持wx.request，做apimock
        if (type === 'App') {
            if (options.record) {
                // 自动开始录制
                state.recording = true;
                state.recordMode = true;
            }
            const originRequest = wx.request;
            Object.defineProperty(wx, 'request', {
                configurable: true,
                enumerable: true,
                writable: true,
                value: function() {
                    const config = arguments[0] || {};
                    let {url, data, method} = config;
                    let { recording, apiRecord } = state;
                    if (recording) {
                        let key =  `${url}__e2e__${method}__e2e__${Object.keys(data).join(',')}`
                        if (!apiRecord.has(key)) {
                            apiRecord.set(key, [])
                        }
                        let originSuccess = config.success;
                        config.success = function() {
                            const res = arguments[0] || {};
                            apiRecord.get(key).push({
                                ...res
                            })

                            originSuccess.apply(this, arguments);
                        }
                        return originRequest.apply(this, arguments);

                    }
                    return originRequest.apply(this, arguments);
                }
            });
        }
        if (['App', 'Page'].indexOf(type) > -1) {
            mountStateAndWrapEvent(vm);
        } else if (type === 'Component') {
            // component特殊处理，created后再挂载，否则会被清除
            let {created} = vm;
            vm.created = function(...args) {
                mountStateAndWrapEvent(this);
                if (created) created.apply(this, args);
            };
        } else {
            throw new Error('不合法的wxa组件类型');
        }
    };
};

module.exports = $$testSuitePlugin;
