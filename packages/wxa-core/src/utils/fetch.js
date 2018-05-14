import wxapi from './wxapi';

let MAXREQUEST = 5; // 最大请求数
// 增加请求队列
let requestQueue = [];
// 请求排队队列
let waitQueue = [];
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
    }
}
// 缓存队列
let cacheRequest = new RequestCache();

function continueQueue() {
    // 队列里面有任务，继续请求。
    while (requestQueue.length < MAXREQUEST && waitQueue.length) {
        // 出队
        let {resolve, reject, configs} = waitQueue.shift();
        // 获取uuid, 根据uuid唯一确定某个请求
        let uuid = new Uuid(requestQueue).get();
        // 压入请求队列
        requestQueue.push({resolve, reject, configs, uuid});
        // 记录请求
        cacheRequest.record(configs);

        $$fetch(configs).then((succ)=>{
            let idx = requestQueue.findIndex((req)=>req.uuid===uuid);
            if (idx >-1) requestQueue.splice(idx, 1);
            continueQueue();
            resolve(succ);
        }, (fail)=>{
            let idx = requestQueue.findIndex((req)=>req.uuid===uuid);
            if (idx >-1) requestQueue.splice(idx, 1);
            continueQueue();
            reject(fail);
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

    return wxapi(wx).request(postconfig)
    .then((response)=>{
        return Promise.resolve(response);
    }, (fail)=>{
        return Promise.reject(fail);
    });
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
    let {$top, $noCache} = axiosConfigs;
    delete axiosConfigs.$top;
    delete axiosConfigs.$noCache;

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
        return new Promise((resolve, reject) => {
            // 排队
            $top ?
                waitQueue.unshift({resolve, reject, configs}) :
                waitQueue.push({resolve, reject, configs});
            continueQueue();
        });
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
