export default (api, fnName) => {
    const noPromiseApi = ['getUpdateManager'];
    // 同步方法
    if ( /^create.+/.test(fnName) || /.*Sync$/.test(fnName) || noPromiseApi.indexOf(fnName) > -1) {
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
