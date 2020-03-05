/*
    # wxa:mock
    为input自动填入响应字符，避免开发时重复花时间手动输入
    *仅开发时启用(NODE_ENV为'development')*
    指令格式1：`wxa:mock="占位符"` 或 `wxa:mock="占位符(参数[,参数])"`
*/

import Mock from 'mockjs';
import wxaMockExtends from './mock-extends';
// import wxaMock from './wxa-mock';
import {addClass} from '../../../utils';

const Random = Mock.Random;
Random.extend(wxaMockExtends(Random));

export default mock;

const DRC_NAME = 'mock';
const DRC_FULL_NAME = 'wxa:' + DRC_NAME;
const DRC_CLASS_NAME = '_drc-' + DRC_NAME;
const DRC_ATTR_NAME = 'data-' + DRC_CLASS_NAME;
const WXA_MOCK_VAR = 'wxaMockVar';

let idCount = 1;

function mock(drc, element, mdl) {
    // drc: {name, value}
    if (isDev()) {
        let targetList = findMockTarget(element);
        targetList.forEach((target) => {
            element.attribs.class = addClass(element.attribs.class, DRC_CLASS_NAME).join(' ');
            element.attribs[DRC_ATTR_NAME] = drc.value;
            delete target.attribs[DRC_FULL_NAME];
            setWarningStyle(target);
            processDataBinding(target);
        });
    }
}

// 已迁移到runtime
// function getMockResult(drc) {
//     let mockResult = '';
//     let drcValuePrefix = drc.value[0];

//     if(drcValuePrefix === '$') {
//         // wxa提供
//         mockResult = wxaMock.mock(drc.value);
//     }else {
//         // mock.js
//         mockResult = Mock.mock(drc.value);
//     }

//     return mockResult;
// }

function findMockTarget(el) {
    let targetList = [];
    let tagName = el.name;
    if (tagName === 'input') {
        targetList.push(el);
    } else {
        if (el.children && el.children.length) {
            el.children.forEach((child) => {
                targetList = targetList.concat(findMockTarget(child));
            });
        }
    }
    return targetList;
}

// input的value对数据绑定的处理
function processDataBinding(target) {
    let valueAttr = target.attribs.value || '';
    valueAttr = valueAttr.trim();
    let hasVarNameReg = /\{\{\s*(\w+(\.\w+)*)+\s*\}\}/;
    let bindVarRegResult = hasVarNameReg.exec(valueAttr);
    // 绑定的Data的key，{{a.b.c}} => a.b.c
    let bindVarName = '';
    if (bindVarRegResult && bindVarRegResult[1]) {
        bindVarName = bindVarRegResult[1];
    } else {
        bindVarName = WXA_MOCK_VAR + getIdCount();
        target.attribs.value = `{{${bindVarName}}}`;
    }
    // 将input绑定的变量名存到dataset，方便运行时获取使用
    target.attribs['data-bind-var'] = bindVarName;
}

// 判断开发环境，避免mock信息上生产环境
function isDev() {
    let env = process.env.NODE_ENV;
    // let envList = [undefined, 'development'];
    let envList = ['development'];
    let isDevEnv = Boolean(~envList.indexOf(env));
    return isDevEnv;
}

function getIdCount() {
    return ++idCount;
}

function setWarningStyle(el) {
    let originStyle = el.attribs.style || '';
    el.attribs.style = originStyle + '; outline: 1px dashed rgba(255,0,0,0.2); text-shadow: #FC0 1px 0 2px !important;';
}
