import Mock from 'mockjs';

export default useMock

function useMock(page){
    // drc: {name, value}
    // 指令名称，指令属性值
    if(isDev()) {
        // let targetList = await findMockTarget(page);
        findMockTarget(page).then((targetList) => {
            targetList.map(target => {
                // setWarningStyle(target);
                let mockResult = getMockResult(target);
                let bindVarName = target.dataset.bindVar;
                setInputData(page, target, bindVarName, mockResult);
            })
        })
    }else {
        console.warn('[wxa:mock]: disabled unless in devolopment env')
    }
}

// 根据mock结果，调用setData设置页面对应的data属性
function setInputData(page, target, bindVarName, mockResult) {
    console.log('>>> setInput', page, target, bindVarName, mockResult);
    page.setData({
        [bindVarName]: mockResult
    })
}

function getMockResult(target) {
    let mockDrc = target.dataset._drcMock;
    let mockResult = '';
    let drcValuePrefix = mockDrc[0];
    console.log('mockDrc', mockDrc);

    if(drcValuePrefix === '$') {
        // wxa提供
        try {
            mockResult = wxaMock.mock(mockDrc);
        }catch {
            console.error(`[wxa:mock]: WXA规则占位符格式有误:[${mockDrc}]`);
        }
    }else {
        // mock.js
        try {
            mockResult = Mock.mock(mockDrc);
        }catch {
            console.error(`[wxa:mock]: Mock.js规则占位符格式有误:[${mockDrc}]`);
        }
    }
    return mockResult;
}

function findMockTarget(page) {
    return new Promise((resolve) => {
        const query = wx.createSelectorQuery();
        query.selectAll('._drc-mock').fields({
            dataset: true,
            properties: ['value']
        }).exec(res => {
            // ？此处res返回二维数组。
            let result = [];
            if(res && res[0]) {
                result = res[0];
            }
            resolve(result);
        })
    })
}

// 判断开发环境，避免mock信息上生产环境
function isDev() {
    // 依赖app.config.js内的APP_ENV配置
    let env = 'APP_ENV';
    // let envList = [undefined, 'development'];
    let envList = ['development'];
    let devPlatformList = [ 'devtools' ];
    let isDevEnv = Boolean(~envList.indexOf(env));
    let isDevTool = Boolean(~devPlatformList.indexOf(wx.getSystemInfoSync().platform));
    let isDev = isDevEnv && isDevTool;
    return isDev;
}

// 设置警示样式，避免mock信息上生产环境
// function setWarningStyle(el){
    // let originStyle = el.attribs.style || '';
    // el.attribs.style = originStyle + '; outline: 1px dashed rgba(255,0,0,0.2); text-shadow: #FC0 1px 0 2px !important;'
// }