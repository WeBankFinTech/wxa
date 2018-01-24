export default (api, fnName) => {
    const noPromiseApi = ['createSelectorQuery'];
    // 同步方法
    if (/.*Sync$/.test(fnName) || noPromiseApi.indexOf(fnName) > -1) {
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
