let $app = null

// 使用内存传递参数，标记上生产页和消费页。 后续消费页消费后清除内存占用
export function setRoutersParams(params, to) {
    _getApp().__routersParams = {
        value: params,
        from: getCurrentURL(),
        to
    }
}

// 消费params，返回params并清除app上的__routersParams
export function comsumeRoutersParams() {
    let params = null;
    let $app = _getApp();
    let routersParams = $app.__routersParams;
    if(routersParams && routersParams.to) {
        console.log('comsumeRoutersParams', routersParams);
        console.log('getCurrentURL(), routersParams.to', getCurrentURL(), routersParams.to)
        if(getCurrentURL() === routersParams.to) {
            params = routersParams.value;
        }else {
            console.warn('路由参数目标不匹配，不进行消费')
        }
    }
    // $app.__routersParams = null;
    return params;
}

function _getApp() {
    if($app && $app.onLaunch) {
        return _app
    }else {
        return getApp();
    }
}

function getCurrentURL() {
    // 注意避免在page生成前调用getCurrentPages
    let currentURL = '';
    try {
        let currentPage = getCurrentPage();
        currentURL = currentPage.route || '';
    }catch(e) {
        console.warn('getCurrentURL', e);
    }
    return currentURL;
}

function getCurrentPage() {
    let pages = getCurrentPages()
    return pages[pages.length-1]
}
