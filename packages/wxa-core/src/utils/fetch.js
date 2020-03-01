import {getPromise} from './helpers.js';

let MAXREQUEST = 5; // 最大请求数
// 增加请求队列
let requestQueue = [];
// 请求排队队列
let waitQueue = [];
// 标记请求
let requestMap = new Map();
/**
 * 请求的uuid
 */
class Uuid {
    /**
     *
     * @param {*} requestQueue
     */
    constructor(requestQueue) {
        this.requestQueue = requestQueue;
    }
    /**
     * uuid
     *
     * @return {Number}
     */
    getUuid() {
        return parseInt((''+Date.now()+Math.ceil(Math.random()*1000)).toString().substr(-8), 10);
    }
    /**
     *
     * @param {Number} uuid
     * @return {Boolean}
     */
    checkUuid(uuid) {
        return this.requestQueue.findIndex((request)=>request.uuid===uuid) > -1;
    }
    /**
     * @return {Number}
     */
    get() {
        let uuid = this.getUuid();
        while (this.checkUuid(uuid)) {
            uuid = this.getUuid();
        };

        return uuid;
    }
}

/**
 * 缓存请求
 */
class RequestCache {
    constructor(expired = 500) {
        this.queue = [];
        this.expired = expired;
    }

    valid(request) {
        if (request.method.toUpperCase() === 'POST') {
            let lastRequest = this.queue.find((req)=>{
                let {
                    url, data, axiosConfigs,
                } = req;

                let cod = request.url === url &&
                JSON.stringify(request.data) === JSON.stringify(data) &&
                JSON.stringify(request.axiosConfigs) === JSON.stringify(axiosConfigs);
                return cod;
            });
            let now = Date.now();
            return !(lastRequest && (now-lastRequest.start)<this.expired);
        } else {
            return true;
        }
    }

    record({url, method, data, axiosConfigs}) {
        if (method.toUpperCase() === 'POST') {
            this.queue.push({
                url, method, data, axiosConfigs,
                start: Date.now(),
            });
            let now = Date.now();
            this.queue = this.queue.filter((req)=>(now - req.start)< this.expired);
        }
    }

    setExpiredTime(time=500) {
        this.expired = time;

        return this.expired;
    }
}
// 缓存队列
let cacheRequest = new RequestCache();

function continueQueue() {
    // 队列里面有任务，继续请求。
    while (requestQueue.length < MAXREQUEST && waitQueue.length) {
        // 出队
        // 获取uuid, 根据uuid唯一确定某个请求
        let {resolve, reject, configs, uuid} = waitQueue.shift();
        // 压入请求队列
        requestQueue.push({resolve, reject, configs, uuid});
        // 记录请求
        cacheRequest.record(configs);

        let promise = $$fetch(configs);
        // 记录请求
        requestMap.set(uuid, promise.$requestTask);

        promise.then((succ)=>{
            let idx = requestQueue.findIndex((req)=>req.uuid===uuid);
            if (idx >-1) requestQueue.splice(idx, 1);
            continueQueue();
            resolve(succ);

            requestMap.delete(uuid);
        }, (fail)=>{
            let idx = requestQueue.findIndex((req)=>req.uuid===uuid);
            if (idx >-1) requestQueue.splice(idx, 1);
            continueQueue();
            reject(fail);

            requestMap.delete(uuid);
        });
    }
}

/**
 *
 * @param {Object} configs
 *
 * @return {Promise}
 */
function $$fetch(configs) {
    let {
        data, url, method, axiosConfigs,
    } = configs;

    let postconfig = {
        url,
        data,
        method,
        timeout: 60000,
        ...axiosConfigs,
    };

    // 改写 promise
    let defer = getPromise();
    let requestTask = wx.request({
        ...postconfig,
        success(response) {
            if (response && response.statusCode === 200) {
                defer.resolve(response);
            } else {
                defer.reject(response);
            }
        },
        fail(fail) {
            defer.reject(fail);
        },
    });

    defer.promise.$requestTask = requestTask;

    return defer.promise;
}


/**
 *
 * @param {*} url
 * @param {*} data
 * @param {*} axiosConfigs
 * @param {*} method
 *
 * @return {Promise}
 */
export default function fetch(url, data = {}, axiosConfigs = {}, method = 'get') {
    let configs = {url, data, axiosConfigs, method};
    let {$top, $noCache, $withCancel} = axiosConfigs;
    delete axiosConfigs.$top;
    delete axiosConfigs.$noCache;
    delete axiosConfigs.$withCancel;

    axiosConfigs = {
        dataType: 'json',
        ...axiosConfigs,
    };
    let validRequest = cacheRequest.valid(configs);

    if ($noCache || validRequest) {
        return $request();
    } else {
        try {
            !validRequest && console && console.warn('重复的请求： ', configs);
        } catch (e) {}

        return Promise.reject({data: {code: -101, msg: '重复的请求'}});
    }

    function $request() {
        let defer = getPromise();
        // 排队
        // 获取uuid, 根据uuid唯一确定某个请求
        let uuid = new Uuid(requestQueue).get();

        $top ?
            waitQueue.unshift({resolve: defer.resolve, reject: defer.reject, configs, uuid}) :
            waitQueue.push({resolve: defer.resolve, reject: defer.reject, configs, uuid});
        continueQueue();

        let cancel = () => {
            let task = requestMap.get(uuid);

            if (task) {
                // 已发送
                task.abort();
            } else {
                // 待发送，出队
                let idx = requestQueue.findIndex((req)=>req.uuid===uuid);
                if (idx >-1) requestQueue.splice(idx, 1);
            }
        };

        return $withCancel ? {request: defer.promise, defer, cancel} : defer.promise;
    }
}

export function setMaxRequest(x) {
    if (x == null) return null;
    MAXREQUEST = +x;
};

export function setRequestExpiredTime(x) {
    if (x == null) return null;
    cacheRequest.setExpiredTime(x);
}
