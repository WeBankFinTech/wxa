export default (api, fnName) => {
    // 同步方法
    if (/.*Sync$/.test(fnName)) {
        return (...params)=>{
            return api(...params);
        };
    } else {
    // 异步方法
        return (options, ...params) => {
            return new Promise((resolve, reject) => {
                api(Object.assign({}, options, {success: resolve, fail: reject}), ...params);
            });
        };
    }
};
