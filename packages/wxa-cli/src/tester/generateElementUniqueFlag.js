const {parse} = require('@babel/parser');
const generate = require('@babel/generator').default;
const traverse = require('@babel/traverse').default;
let Coder = require('../helpers/coder').default;

let coder = new Coder();

// wxa 解析xml时encode了两次
// 所以这里decode两次
function decodeTemplate(content) {
    return coder.decode(coder.decode(content));
}

// 解析获得 `{{}}` 中的表达式
function getExpression(content) {
    let isSingleQuotes = false;
    let isDoubleQuotes = false;
    let isTemplateStr = false;
    const singleQuotes = '\'';
    const doubleQuotes = '"';
    const templateStr = '`';

    const canStart = (open) =>
        open === '{{' && !isSingleQuotes && !isDoubleQuotes && !isTemplateStr;
    const canEnd = (close) =>
        close === '}}' && !isSingleQuotes && !isDoubleQuotes && !isTemplateStr;

    const isQuotes = function(s) {
        return [singleQuotes, doubleQuotes, templateStr].includes(s);
    };

    const expressions = [];
    let current = '';
    let isExpression = false;

    for (let i = 0; i < content.length; i++) {
        const c = content[i];
        const n = content[i + 1];

        if (c === '\\' && isQuotes(n)) {
            i++;
            if (isExpression) {
                current += c + n;
            }
            continue;
        } else if (c === singleQuotes) {
            isSingleQuotes = !isSingleQuotes;
        } else if (c === doubleQuotes) {
            isDoubleQuotes = !isDoubleQuotes;
        } else if (c === templateStr) {
            isTemplateStr = !isTemplateStr;
        } else if (canStart(c + n)) {
            isExpression = true;
            i++;
            continue;
        } else if (canEnd(c + n)) {
            expressions.push(current);
            current = '';
            isExpression = false;
            i++;
        }

        if (isExpression) {
            current += c;
        }
    }

    return expressions;
}

/**
 * 替换js表达式中的[index]
 * @param {string} expression js表达式
 * @param {array} nflgas 新Identifier节点名称集合
 * @param {array} oflags 旧Identifier节点名称集合
 * @return {string}
 */
function replaceExpression(expression, nflgas, oflags) {
    if (!nflgas || !nflgas.length) {
        return;
    }

    let ast = null;
    // ast树
    try {
        ast = parse(expression);
    } catch (error) {
        throw new Error(`表达式 ${expression} 解析出错`);
    }

    traverse(ast, {
        enter(path) {
            // 是对象属性时跳过该节点
            if (path.isMemberExpression() && !path.node.computed) {
                path.skip();
            }

            nflgas.forEach((nflag, index) => {
                let oflag = oflags[index];
                if (path.isIdentifier({name: oflag})) {
                    path.node.name = nflag;
                }
            });
        },
    });

    // 输出时，不能有空行
    // 否则小程序将解析失败
    return generate(ast, {compact: true}).code.slice(0, -1);
}

function handleExpression(text, nIndexs, oIndexs) {
    if (!text || !nIndexs || !nIndexs.length) {
        return text;
    }

    let changedNewIndexs = [];
    let changedOldIndex = [];
    const lowerIndexs = [];
    for (let i = nIndexs.length - 1; i >= 0; i--) {
        const nIndex = nIndexs[i];
        const oIndex = oIndexs[i];
        if (nIndex !== oIndex && !lowerIndexs.includes(nIndex)) {
            changedNewIndexs.push(nIndex);
            changedOldIndex.push(oIndex);
        }
        lowerIndexs.push(nIndex);
    }

    if (!changedNewIndexs.length) {
        return text;
    }

    const expressions = getExpression(text);

    if (!expressions.length) {
        return text;
    }

    expressions.forEach((expression) => {
        const exp = replaceExpression(
            decodeTemplate(expression),
            changedNewIndexs,
            changedOldIndex,
            text,
            expressions
        );
        // exp 中不要带 $
        // 在 replace 函数中，替代字符串中 $ 有特殊含义
        text = text.replace(expression, exp);
    });

    return text;
}

class HandleAttribs {
    constructor(attribs) {
        this.attribs = attribs || {};
    }

    get(key) {
        return this.attribs[key];
    }

    delete(key) {
        delete this.attribs[key];
    }

    push(obj) {
        Object.assign(this.attribs, obj);
    }

    set(key, value) {
        this.attribs[key] = value;
    }
}

function getElementIndex(element) {
    let index = 0;
    let prev = element.prev;

    while (prev) {
        if (prev.type === 'tag') {
            index++;
        }
        prev = prev.prev;
    }

    return index;
}

// 获取节点在父节点下的唯一标志
function getlementUniqueFlagInParent(element, uniqueFlagAttr) {
    let parent = element.parent;
    let parentUniqueFlag = '';

    if (parent) {
        parentUniqueFlag = parent.attribs[uniqueFlagAttr];
    }

    let index = getElementIndex(element);

    function getName() {
        return element.name || '';
    }

    // 父节点的 uniqueFlag + tagName + element 在父节点下的索引
    if (parentUniqueFlag) {
        return `${parentUniqueFlag}--${getName()}${index}`;
    }

    // tagName + 索引
    return `${getName()}${index}`;
}

function assembleUniqueId(keyElement) {
    return keyElement.reduce((prev, key) => {
        if (key) {
            if (prev) {
                return prev + '_' + key;
            }

            return prev + key;
        } else {
            return prev;
        }
    }, '');
}

function generateElementUniqueFlag(dom, options = {}) {
    let defalutOptions = {
        indexPrefix: 'index',
        flagKey: 'uflag',
        filePath: '',
    };
    let currentOptions = Object.assign({}, defalutOptions, options);
    let {indexPrefix, flagKey, filePath} = currentOptions;
    // 存储嵌套index的栈
    const nIndexs = [];
    // 存储wx:for节点的栈
    const loopNodes = [];
    // 存储旧的index的栈
    const oIndexs = [];
    let currentIndex = '';
    let deep = 0;
    let isRoot = true;

    function travel(dom) {
        dom.forEach((element) => {
            const attribs = element.attribs;
            if (attribs) {
                const attrs = new HandleAttribs(attribs);

                if (attrs.get('wx:for')) {
                    if (attrs.get('wx:for-index')) {
                        const index = attrs.get('wx:for-index');
                        nIndexs.push(index);
                        oIndexs.push(index);
                        currentIndex = index;
                    } else {
                        const index = `${indexPrefix}_${deep}`;
                        // 主动设置wx:for-index
                        attrs.set('wx:for-index', index);
                        nIndexs.push(index);
                        oIndexs.push('index');
                        currentIndex = index;
                    }
                    loopNodes.push(element);
                    deep++;
                }

                // 为每个节点注入唯一标志
                let attr = `data-${flagKey}`;
                // 在父节点下的唯一标志（与父节点唯一标志、标签名、在父节点下的位置索引有关）
                let uniqueFlagInParent = getlementUniqueFlagInParent(
                    element,
                    attr
                );
                // wx:for 组件内唯一标志与上层所有 index 有关
                // 当发现 wx:for 时，该节点唯一标志与 index 有关
                // 这样其所有子节点唯一标志都将与这个 index 有关
                // 这样即使是嵌套循环，也能保证内部节点唯一标志与上层每个 wx:for 相关
                const indexsStr = currentIndex ? `{{${currentIndex}}}` : '';
                let keys = [];
                // 多个wxml文件时，还需在根节点加上文件路径，才能确保每个元素生成的标志唯一
                if (isRoot) {
                    keys.push(filePath);
                }
                keys = [
                    ...keys,
                    uniqueFlagInParent,
                    indexsStr,
                    attrs.get('id'),
                ];
                let uniqueFlag = assembleUniqueId(keys);
                const obj = {
                    [attr]: uniqueFlag,
                };
                attrs.push(obj);

                // 处理for+template标签组合
                if (element.name === 'template') {
                    // 太麻烦，暂未处理
                    // doSomething
                } else {
                    Object.keys(attribs).forEach((key) => {
                        attribs[key] = handleExpression(
                            attribs[key],
                            nIndexs,
                            oIndexs
                        );
                    });
                }
            } else if (element.type === 'text') {
                element.data = handleExpression(element.data, nIndexs, oIndexs);
            }

            if (element.children) {
                isRoot = false;
                currentIndex = '';
                travel(element.children);
            }

            // 回溯到wx:for节点时
            if (element === loopNodes[loopNodes.length - 1]) {
                nIndexs.pop();
                oIndexs.pop();
                loopNodes.pop();
                deep--;
            }
        });
    }

    travel(dom);
}

module.exports = {
    generateElementUniqueFlag,
};
