let __routersParams = null;

export function getRoutersParams() {
    return __routersParams;
}

// 使用内存传递参数，标记上生产页和消费页。 后续消费页消费后清除内存占用
export function setRoutersParams(params, to) {
    __routersParams = {
        value: params, 
        from: getCurrentURL(), 
        to
    }
}

// 消费params，返回params并清除__routersParams
export function comsumeRoutersParams() {
    let params = null;
    let routersParams = __routersParams;
    if(routersParams && routersParams.to) {
        if(getCurrentURL() === routersParams.to) {
            params = routersParams.value;
        }else {
            console.warn('路由参数目标不匹配，不进行消费')
        }
    }
    // $app.__routersParams = null;
    __routersParams = null;
    return params;
}

function getCurrentURL() {
    // 注意避免在page生成前调用getCurrentPages
    let currentURL = '';
    try {
        let curPages = getCurrentPages();
        let fromPage = curPages[curPages.length-1];
        currentURL = fromPage.route || '';
    }catch(e) {
        console.warn('getCurrentURL', e);
    }
    return currentURL;
}
