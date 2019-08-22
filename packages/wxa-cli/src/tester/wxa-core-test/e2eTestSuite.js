

const IDKEY = '_wxatestuniqueid';
const EVENTMAPKEY = '_wxatesteventmap';
let lastEventTime = {};
let state = {
    record: [],
    recording: false
}

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

// 增加一条操作记录
const addRecord = function (type, ...args) {
    let e = args[0];
    let target = e.target.dataset[IDKEY] ? e.target : e.currentTarget;
    if (state.recording) {
        let id = target.dataset[IDKEY];
        // 已经记录过相同timestamp的事件，说明是冒泡的，不再记录
        if (lastEventTime[type] && lastEventTime[type].id === id && lastEventTime[type].timeStamp === e.timeStamp) {
            return;
        }
        lastEventTime[type] = {};
        lastEventTime[type].timeStamp = e.timeStamp;
        lastEventTime[type].id = id;
        let pages = getCurrentPages();
        state.record.push({
            page: pages[pages.length - 1].route,
            event: type,
            id,
            timeStamp: +new Date()
        });
    }
    // 调用eventMap中原方法
    let eventFunc = getEventFunc(type, target.dataset[EVENTMAPKEY]);
    if (eventFunc) {
        this[eventFunc](...args);
    }
}

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
    }
}

// 将替换事件挂载到vm上
const mountStateAndWrapEvent = (vm) => {
    for (let key in wrapEvent) {
        vm[key] = wrapEvent[key]
    }
    vm.$$e2e_state = state;
}

let $$testSuitePlugin = (options) => {
    // vm是当前实例，type为实例类型
    return (vm, type)=>{
        if(['App', 'Page'].indexOf(type) > -1){
            mountStateAndWrapEvent(vm);
        }else if (type === 'Component') {
            // component特殊处理，created后再挂载，否则会被清除
            let { created } = vm;
            vm.created = function (...args) {
                mountStateAndWrapEvent(this);
                if (created) created.apply(this, args);
            }
        } else {
            throw new Error('不合法的wxa组件类型');
        }
    }
}
