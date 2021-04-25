/* eslint-disable no-invalid-this */
/* eslint-disable no-undef */

const IDKEY = '_wxatestuniqueid';
const EVENTMAPKEY = '_wxatesteventmap';
let lastEventTime = {};
let state;

// 获取eventMap中对应事件方法
function getEventFunc(eventType, eventMap) {
    // eventMap格式 tap:$go|longpress:$press
    if (!eventMap) return null;
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
// 递归向上查找自定义组件
function findParent(obj, id) {
    let new_id = id;
    if (obj.is && obj.is.slice(0, 11) === 'components/') {
        // 是个组件
        new_id = `${obj.dataset[IDKEY]}-${id}`;
        let parent = obj.selectOwnerComponent();
        if (parent.is.slice(0, 11) === 'components/') {
            return findParent(parent, new_id)
        }
    }
    return new_id;
}

// 增加一条操作记录
const addRecord = function(type, ...args) {
    let e = args[0];
    let target = e.target.dataset[IDKEY] ? e.target : e.currentTarget;
    let id = target.dataset[IDKEY];
    // 先判断是否需要记录
    if (shouldRecord.bind(this)(type, ...args)) {
        // tab-bar的操作直接忽略，因为回放找不到
        if (this.is.slice(0, 14) !== 'custom-tab-bar') {
            let pages = getCurrentPages();
            let currentPage = pages[pages.length - 1];
            id = findParent(this, id);
            state.record.push({
                action: {
                    ...e,
                    page: joinURLQuery(currentPage.route, currentPage.options),
                    event: type,
                    id,
                    timeStamp: +new Date()
                }
            });
            console.log('e2eRecord:', e, id)
        }

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
    $$e2e_navigator(...args) {
        addRecord.bind(this)('navigator', ...args);
    },
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

function joinURLQuery(url, query) {
    let queryKey = Object.keys(query);
    if (queryKey.length > 0) {
        url += '?';
        // TODO
        queryKey.forEach((key) => {
            url += `${key}=${query[key]}&`
        })
    }
    return url;
}

// 劫持switchtab事件
const hjSwitchTab = () => {
    wx.onAppRoute(function(e) {
        if (e.openType === 'switchTab') {
            let action = {
                event: 'switchTab',
                path: '/' + e.path,
                query: e.query
            };
            if (state.record.length === 0) {
                let launchOpts = wx.getLaunchOptionsSync();
                action.appStartPage = joinURLQuery(launchOpts.path, launchOpts.query)
            }
            state.record.push({
                action
            })
        }
    });
}

let $$testSuitePlugin = (options) => {
    state = options.state;
    // vm是当前实例，type为实例类型
    return (vm, type)=>{
        // 劫持wx.request，做apimock
        if (type === 'App') {
            if (options.record) {
                // 自动开始录制
                state.recording = true;
                state.recordMode = true;
                hjSwitchTab();
            }
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
