import promisify from './promisify';
// let f = ;
// ReturnType<WechatMiniprogram.Wx[K]>
// WechatMiniprogram.Wx[K]

// <K extends keyof WechatMiniprogram.Wx>
type promiseFunction = (...args: any[]) => Promise<any>;

export type IWXAPromiseAPI = Partial<WechatMiniprogram.Wx & {
    [K in keyof WechatMiniprogram.Wx]: promiseFunction;
}>;

/**
 * promise化微信的api
 */
const _wxapi: IWXAPromiseAPI = {};
let noPromiseApi = ['getUpdateManager', 'nextTick'];
let isInit = false;


export default function wxapi(wx: WechatMiniprogram.Wx): IWXAPromiseAPI {
    if (isInit) return _wxapi;

    Object.keys(wx).forEach((key) => {
        // 同步方法
        if (
            /^create.+/.test(key) ||
            /.*Sync$/.test(key) ||
            /^on.+/.test(key) ||
            noPromiseApi.indexOf(key) > -1
        ) {
            _wxapi[key] = wx[key];
        } else {
            _wxapi[key] = promisify(wx[key]);
        }
    });
    isInit = true;
    return _wxapi;
}

export function addNoPromiseApi(name) {
    if (typeof name === 'string') {
        // re-promisify after add NoPromiseApi
        isInit = false;
        noPromiseApi.push(name);
    } else if (Array.isArray(name)) {
        isInit = false;
        noPromiseApi = noPromiseApi.concat(name);
    } else {
        return false;
    }
}
