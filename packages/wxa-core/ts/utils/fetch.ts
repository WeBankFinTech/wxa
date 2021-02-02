import {getPromise, WXAPromise} from './helpers';

interface WXAFetchRequestOptions {
    url: string;
    data: any;
    axiosConfigs: any;
    method: string;
    [prop: string]: any;
}

interface WXAFetchRequest {
    resolve: AnyFunction;
    reject: AnyFunction;
    configs: WXAFetchRequestOptions;
    uuid?: number;
}

let MAXREQUEST = 5; // 最大请求数
// 增加请求队列
const requestQueue: WXAFetchRequest[] = [];
// 请求排队队列
const waitQueue: WXAFetchRequest[] = [];
// 标记请求
const requestMap = new Map();
/**
 * 请求的uuid
 */
class Uuid {
    private requestQueue: WXAFetchRequest[];
    /**
     *
     * @param {*} rq
     */
    constructor(rq: WXAFetchRequest[]) {
        this.requestQueue = rq;
    }
    /**
     * uuid
     *
     * @return {Number}
     */
    getUuid() {
        // tslint:disable-next-line: prefer-template
        return parseInt(('' + Date.now() + Math.ceil(Math.random() * 1000)).toString().substr(-8), 10);
    }
    /**
     *
     * @param {Number} uuid
     * @return {Boolean}
     */
    checkUuid(uuid) {
        return this.requestQueue.findIndex((request) => request.uuid === uuid) > -1;
    }
    /**
     * @return {Number}
     */
    get() {
        let uuid = this.getUuid();
        while (this.checkUuid(uuid)) {
            uuid = this.getUuid();
        }

        return uuid;
    }
}

/**
 * 缓存请求
 */
// tslint:disable-next-line: max-classes-per-file
class RequestCache {
    private queue: (WXAFetchRequestOptions & {start: number})[] = [];
    private expired: number;

    constructor(expired = 500) {
        this.expired = expired;
    }

    valid(request: WXAFetchRequestOptions) {
        if (request.method.toUpperCase() === 'POST') {
            const lastRequest = this.queue.find((req) => {
                const {
                    url, data, axiosConfigs,
                } = req;

                const cod = request.url === url &&
                JSON.stringify(request.data) === JSON.stringify(data) &&
                JSON.stringify(request.axiosConfigs) === JSON.stringify(axiosConfigs);
                return cod;
            });
            const now = Date.now();
            return !(lastRequest && (now - lastRequest.start) < this.expired);
        }
        return true;
    }

    record({url, method, data, axiosConfigs}) {
        if (method.toUpperCase() === 'POST') {
            this.queue.push({
                url, method, data, axiosConfigs,
                start: Date.now(),
            });
            const now = Date.now();
            this.queue = this.queue.filter((req) => (now - req.start) < this.expired);
        }
    }

    setExpiredTime(time = 500) {
        this.expired = time;

        return this.expired;
    }
}
// 缓存队列
const cacheRequest = new RequestCache();

function continueQueue(): void {
    // 队列里面有任务，继续请求。
    while (requestQueue.length < MAXREQUEST && waitQueue.length) {
        // 出队
        // 获取uuid, 根据uuid唯一确定某个请求
        const {resolve, reject, configs, uuid} = waitQueue.shift();
        // 压入请求队列
        requestQueue.push({resolve, reject, configs, uuid});
        // 记录请求
        cacheRequest.record(configs);

        const promise = makeRequest(configs);
        // 记录请求
        requestMap.set(uuid, (promise as any).$requestTask);

        promise.then((succ) => {
            const idx = requestQueue.findIndex((req) => req.uuid === uuid);
            if (idx > -1) requestQueue.splice(idx, 1);
            continueQueue();
            resolve(succ);

            requestMap.delete(uuid);
        }, (fail) => {
            const idx = requestQueue.findIndex((req) => req.uuid === uuid);
            if (idx > -1) requestQueue.splice(idx, 1);
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
function makeRequest(configs: WXAFetchRequestOptions) {
    const {
        data, url, method, axiosConfigs,
    } = configs;

    const postconfig = {
        url,
        data,
        method,
        timeout: 60000,
        ...axiosConfigs,
    };

    // 改写 promise
    const defer = getPromise();
    const requestTask = wx.request({
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

    (defer.promise as any).$requestTask = requestTask;

    return defer.promise;
}

type WXAFetchReturn = Promise<any> | { request: Promise<any>, defer: WXAPromise, cancel: (...args: any[]) => any };

/**
 *
 * @param {*} url
 * @param {*} data
 * @param {*} axiosConfigs
 * @param {*} method
 *
 * @return {Promise}
 */
export default function fetch(url: string, data: AnyObject = {}, axiosConfigs: AnyObject = {}, method = 'get') : WXAFetchReturn {
    const configs = {url, data, axiosConfigs, method};
    const {$top, $noCache, $withCancel} = axiosConfigs;
    delete axiosConfigs.$top;
    delete axiosConfigs.$noCache;
    delete axiosConfigs.$withCancel;

    // tslint:disable-next-line: no-parameter-reassignment
    axiosConfigs = {
        dataType: 'json',
        ...axiosConfigs,
    };
    const validRequest = cacheRequest.valid(configs);

    if ($noCache || validRequest) {
        return $request();
    } 

    try {
        // tslint:disable-next-line: no-unused-expression
        !validRequest && console && console.warn('重复的请求： ', configs);
        // tslint:disable-next-line: no-empty
    } catch (e) { }

    return Promise.reject({data: {code: -101, msg: '重复的请求'}});

    function $request() {
        const defer = getPromise();
        // 排队
        // 获取uuid, 根据uuid唯一确定某个请求
        const uuid = new Uuid(requestQueue).get();

        $top ?
            waitQueue.unshift({configs, uuid, resolve: defer.resolve, reject: defer.reject}) :
            waitQueue.push({configs, uuid, resolve: defer.resolve, reject: defer.reject});
        continueQueue();

        const cancel = () => {
            const task = requestMap.get(uuid);

            if (task) {
                // 已发送
                task.abort();
            } else {
                // 待发送，出队
                const idx = requestQueue.findIndex((req) => req.uuid === uuid);
                if (idx > -1) requestQueue.splice(idx, 1);
                defer.reject({errMsg: 'request:fail abort', $wxaRequestAbort: true});
            }
        };

        return $withCancel ? {defer, cancel, request: defer.promise} : defer.promise;
    }
}

export function setMaxRequest(x: number) {
    if (x == null) return null;
    MAXREQUEST = +x;
}

export function setRequestExpiredTime(x: number) {
    if (x == null) return null;
    cacheRequest.setExpiredTime(x);
}
