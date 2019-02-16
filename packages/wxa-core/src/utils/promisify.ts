type WxCallback = wx.WX[keyof wx.WX];
type WxCallbackArgs = Parameters<WxCallback>;
type UnionToIntersection<U> =
    (U extends any ? (k: U)=>void : never) extends ((k: infer I)=>void) ? I : never;


export default function promisify(api: UnionToIntersection<WxCallback>) {
    return (...argument: WxCallbackArgs) => {
        if(argument.length === 1 && typeof argument[0] === 'object') {
            return new Promise((resolve, reject) => {
                api({...(argument[0] as object), success: resolve, fail: reject});
            });
        }
    };
};
