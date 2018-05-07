import promisify from './promisify';
/**
 * promise化微信的api
 */
let wxapi = {};
let noPromiseApi = ['getUpdateManager'];
let isInit = false;

export default function wxapi(wx) {
    if (isInit) return wxapi;
    else {
        Object.keys(wx).forEach((key)=>{
            // 同步方法
            if ( /^create.+/.test(key) || /.*Sync$/.test(key) || noPromiseApi.indexOf(key) > -1) {
                wxapi[key] = wx[key];
            } else {
                wxapi[key] = promisify(wx[key], key);
            }
        });
        return wxapi;
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
