/*
    # wxa:mock
    为input自动填入响应字符，避免开发时重复花时间手动输入
    *仅开发时启用(NODE_ENV为空或==='development')*
    指令格式1：`wxa:mock="占位符"` 或 `wxa:mock="占位符(参数[,参数])"`
*/

import Mock from 'mockjs';
import wxaMockExtends from './mock-extends';
import wxaMock from './wxa-mock';

const Random = Mock.Random;
Random.extend(wxaMockExtends(Random));

export default mock;

function mock(drc, element, mdl){
    // drc: {name, value}
    if(isDev()) {
        let targetList = findMockTarget(element);
        targetList.forEach(target => {
            let mockResult = getMockResult(drc);
            target.attribs.value = mockResult;
            setWarningStyle(target);
        })
    }
}

function getMockResult(drc) {
    let mockResult = '';
    let drcValuePrefix = drc.value[0];

    if(drcValuePrefix === '$') {
        // wxa提供
        mockResult = wxaMock.mock(drc.value);
    }else {
        // mock.js
        mockResult = Mock.mock(drc.value);
    }
    
    return mockResult;
}

function findMockTarget(el) {
    let targetList = [];
    let tagName = el.name;
    if(tagName === 'input') {
        targetList.push(el);
    }else {
        if(el.children && el.children.length) {
            el.children.forEach(child => {
                targetList = targetList.concat(findMockTarget(child));
            })
        }
    }
    return targetList;
}



// 设置警示样式，避免mock信息上生产环境
function setWarningStyle(el){
    let originStyle = el.attribs.style || '';
    el.attribs.style = originStyle + '; outline: 1px dashed rgba(255,0,0,0.2); text-shadow: #FC0 1px 0 2px !important;'
}
// 判断开发环境，避免mock信息上生产环境
function isDev() {
    let env = process.env.NODE_ENV;
    let isDevEnv = Boolean(~[undefined, 'development'].indexOf(env));
    return isDevEnv;
}
