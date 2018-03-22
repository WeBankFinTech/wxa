import wxapi from './wxapi';

const req = wxapi.request;
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
 *
 */
function continueQueue() {
    // 队列里面有任务，继续请求。
    while (requestQueue.length < MAXREQUEST && waitQueue.length) {
        // 出队
        let {resolve, reject, configs} = waitQueue.shift();
        // 获取uuid, 根据uuid唯一确定某个请求
        let uuid = new Uuid(requestQueue).get();
        // 压入请求队列
        requestQueue.push({resolve, reject, configs, uuid});

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

        // return;
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

    return req(postconfig)
    .then((response)=>{
        return Promise.resolve(response);
    }, (fail)=>{
        return Promise.reject(fail);
    });
}

fetch.prototype.setMaxRequest = (x)=>{
    MAXREQUEST = x;
};
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
    let {$top} = axiosConfigs;
    delete axiosConfigs.$top;

    axiosConfigs = {
        dataType: 'json',
        ...axiosConfigs,
    };
    return new Promise((resolve, reject) => {
        // 排队
        $top ?
            waitQueue.unshift({resolve, reject, configs}) :
            waitQueue.push({resolve, reject, configs});
        continueQueue();
    });
}
