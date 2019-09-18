import promisify from './promisify';

/**
 * promise化微信的api
 */
let _wxapi: any = {};
let noPromiseApi = ['getUpdateManager', 'nextTick'];
let isInit = false;

export default function wxapi(wx) {
    if (isInit) return _wxapi;
    else {
        Object.keys(wx).forEach((key)=>{
            // 同步方法
            if (
                /^create.+/.test(key) ||
                /.*Sync$/.test(key) ||
                /^on.+/.test(key) ||
                noPromiseApi.indexOf(key) > -1
            ) {
                _wxapi[key] = wx[key];
            } else {
                // FIXME: 这里也是，addNoPromiseApi 只用到了第一个参数
                // _wxapi[key] = promisify(wx[key], key);
                _wxapi[key] = promisify(wx[key]);
            }
        });
        return _wxapi;
    }
};

export function addNoPromiseApi(name) {
    if (typeof name === 'string') {
        noPromiseApi.push(name);
    } else if (Array.isArray(name)) {
        noPromiseApi = noPromiseApi.concat(name);
    } else {
        return false;
    }
}
