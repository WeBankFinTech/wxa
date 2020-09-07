/*
    # wxa:mock
    为input自动填入响应字符，避免开发时重复花时间手动输入
    *仅开发时启用*
    指令格式1：`wxa:mock="占位符"` 或 `wxa:mock="占位符(参数[,参数])"`
*/

import {addClass} from '../../utils';
export default mock;

// ============================================================

// Const -------------------------------
// *[指令名称]
const DRC_NAME = 'mock';
// *[指令全名] 包含'wxa:'前缀的全名
const DRC_FULL_NAME = 'wxa:' + DRC_NAME;
// *[目标节点的className] 指令对应className，添加到目标节点上，便于运行时进行选择
const DRC_CLASS_NAME = '_drc-' + DRC_NAME;
// *[目标节点的dataset属性名] 保存对应指令内容的dataset属性名，添加到目标节点上，便于运行时进行读取
const DRC_ATTR_NAME = 'data-' + DRC_CLASS_NAME;

// Config -------------------------------
// 用于随机生成model名的前缀
const WXA_MOCK_VAR = 'wxaMockVar';
let idCount = 1;


// >>>> Main -----------------------------
function mock(drc, element, app) {
    console.log(app.cmdOptions);
    if (
        app.cmdOptions.mock &&
        // 非生产环境
        ['prod', 'production'].indexOf(process.env.NODE_ENV) === -1
    ) {
        app.addDirective('mock');

        // 找到需要执行指令命令的节点
        let targetList = findMockTarget(element);
        targetList.forEach((target) => {
            // 设置指令相应的class
            element.attribs.class = addClass(element.attribs.class, DRC_CLASS_NAME).join(' ');
            // 将指令内容存入dataset，方便运行时获取
            element.attribs[DRC_ATTR_NAME] = drc.value;
            // 在元素上删除指令代码
            delete target.attribs[DRC_FULL_NAME];
            // 设置警告样式
            setWarningStyle(target);
            // 进行model绑定
            processDataBinding(target);
        });
    } else {
        // 清理元素
        delete element.attribs[drc.raw];
    }
}

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

function getIdCount() {
    return ++idCount;
}

function setWarningStyle(el) {
    let originStyle = el.attribs.style || '';
    el.attribs.style = originStyle + '; outline: 1px dashed rgba(255,0,0,0.2); text-shadow: #FC0 1px 0 2px !important;';
}
