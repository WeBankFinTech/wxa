import promisify from './promisify';

/**
 * promise化微信的api
 */
type Wxapi = Partial<Record<keyof wx.WX, any>>;
type WxCallback = wx.WX[keyof wx.WX];
type UnionToIntersection<U> =
    (U extends any ? (k: U)=>void : never) extends ((k: infer I)=>void) ? I : never;

let _wxapi: Wxapi = {};
let noPromiseApi = ['getUpdateManager', 'nextTick'];
let isInit = false;

export default function wxapi(wx: wx.WX): Wxapi {
    if (isInit) return _wxapi;
    else {
        Object.keys(wx).forEach((key: keyof wx.WX) => {
            // 同步方法
            if (
                /^create.+/.test(key) ||
                /.*Sync$/.test(key) ||
                /^on.+/.test(key) ||
                noPromiseApi.indexOf(key) > -1
            ) {
                _wxapi[key] = wx[key];
            } else {
                _wxapi[key] = promisify((wx[key] as UnionToIntersection<WxCallback>));
            }
        });
        return _wxapi;
    }
};

export function addNoPromiseApi(name: string | any[]): void | boolean {
    if (typeof name === 'string') {
        noPromiseApi.push(name);
    } else if (Array.isArray(name)) {
        noPromiseApi = noPromiseApi.concat(name);
    } else {
        return false;
    }
}
