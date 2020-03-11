import Mock from 'mockjs';
import wxaMockExtends from './mock-extends';

export default useMock;

// ============================================================

// Preprocessor -----------------------------
const Random = Mock.Random;
Random.extend(wxaMockExtends(Random));

// >>>> Main -----------------------------
function useMock(page) {
    // drc: {name, value}
    // 指令名称，指令属性值
    try {
        findMockTarget(page).then((targetList) => {
            targetList.map((target) => {
                let mockResult = getMockResult(target);
                let bindVarName = target.dataset.bindVar;
                // 根据mock结果，调用setData设置页面对应的data属性
                setInputData(page, target, bindVarName, mockResult);
            });
        });
    } catch (e) {
        console.warn('[wxa:mock runtime]: error', e);
    }
}

function setInputData(page, target, bindVarName, mockResult) {
    console.log('[wxa:mock] set input data', target, bindVarName, mockResult);
    page.setData({
        [bindVarName]: mockResult,
    });
}

function getMockResult(target) {
    let mockDrc = target.dataset._drcMock;
    let mockResult = '';
    let drcValuePrefix = mockDrc[0];

    // if (drcValuePrefix === '$') {
    //     // wxa提供
    //     try {
    //         mockResult = wxaMock.mock(mockDrc);
    //     } catch (e) {
    //         console.error(`[wxa:mock]: WXA规则占位符格式有误:[${mockDrc}]`);
    //     }
    // } else {
        // mock.js
        try {
            mockResult = Mock.mock(mockDrc);
        } catch (e) {
            console.error(`[wxa:mock]: Mock.js规则占位符格式有误:[${mockDrc}]`);
        }
    // }
    return mockResult;
}

function findMockTarget(page) {
    return new Promise((resolve) => {
        const query = wx.createSelectorQuery();
        query.selectAll('._drc-mock').fields({
            dataset: true,
            properties: ['value'],
        }).exec((res) => {
            // ？此处res返回二维数组。
            let result = [];
            if (res && res[0]) {
                result = res[0];
            }
            resolve(result);
        });
    });
}
