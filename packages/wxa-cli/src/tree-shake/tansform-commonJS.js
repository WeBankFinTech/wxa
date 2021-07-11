let path = require('path');

const traverse = require('@babel/traverse').default;
const generate = require('@babel/generator').default;
const {
    readFile,
    writeFile,
    parseESCode,
    isChildNode,
    unique,
} = require('./util');
let t = require('@babel/types');
const config = require('./config');

let options = {};

function getStaticValue(node) {
    if (t.isStringLiteral(node) || t.isNumericLiteral(node)) {
        return node.value;
    } else if (
        t.isTemplateLiteral(node) &&
        !node.arguments[0].expressions.length
    ) {
        return node.arguments[0].quasis[0].value.raw;
    }

    return false;
}

// node: MemberExpression
function getStaticMemberPro(node) {
    if (node.computed) {
        return getStaticValue(node.property);
    }

    return node.property.name;
}

class TransformCommonJs {
    state = {
        // {
        //   moduleName: exports Path
        // }
        cjsExportModules: new Map(),
        // {
        //   src: [moduleName]
        // }
        cjsRequireModules: new Map(),
        renamed: new Map(),
        identifiers: new Set(),
        isCJS: false,
        isESM: false,
        deletedNodes: new Map(),
        usedExports: new Set(),
        isDynamicUsedExportsProperty: false,
        isUsedExportsObject: false,
    };

    constructor({src, code, ast}) {
        this.src = src;
        this.code = code;
        this.ast = ast || parseESCode(code);

        let dynamicRequireTargets = config.commonJS.dynamicRequireTargets || [];
        // 如果一个模块被其他模块动态导入
        // 不对这个模块做任何处理
        if (dynamicRequireTargets.includes(src) || !config.commonJS.enable) {
            return;
        }

        this.ingorekeys = config.commonJS.ingoreKeys;

        this.transform(this.ast, options);

        if (this.state.isCJS) {
            console.log('---------');
            console.log('cjsRequireModules', this.state.cjsRequireModules);
            console.log('usedExports', this.state.usedExports);
            console.log(
                'isDynamicUsedExportsProperty',
                this.state.isDynamicUsedExportsProperty
            );
            console.log('isUsedExportsObject', this.state.isUsedExportsObject);
            // console.log('cjsExportModules', this.state.cjsExportModules);
            console.log('---------');
        }
    }

    reset() {
        this.state.deletedNodes.forEach((path, node) => {
            if (t.isProgram(path)) {
                path.node.body.push(node);
            } else {
                path.insertBefore(node);
            }
        });
    }

    deleteCJSExport(exportName) {
        if (
            this.state.isDynamicUsedExportsProperty ||
            this.state.usedExports.has(exportName) ||
            this.state.isUsedExportsObject
        ) {
            return;
        }

        console.log(exportName);

        Array.from(this.state.cjsExportModules).some(([name, cjsPath]) => {
            if (exportName === name) {
                cjsPath.remove();
                return true;
            }
        });
    }

    markNodeDeep(node, flag) {
        node[flag] = true;
        traverse(node, {
            noScope: true,
            enter(path) {
                let {node} = path;
                node[flag] = true;
            },
        });
    }

    transform(ast, options = {}) {
        let that = this;
        traverse(ast, {
            CallExpression: {
                enter: (path) => {
                    const {node} = path;

                    if (
                        t.isIdentifier(node.callee) &&
                        node.callee.name === 'require'
                    ) {
                        this.state.isCJS = true;

                        let source = getStaticValue(node.arguments[0]);

                        if (source === false) {
                            console.warn(
                                `Dynamic cjsRequireModules are not currently supported: ${path.toString()}. please configure dynamicrequiretargets`
                            );

                            return;
                        }

                        let {parentPath} = path;
                        let {node: parentNode} = parentPath;

                        let requireNames =
                            this.state.cjsRequireModules.get(source);
                        if (!requireNames) {
                            requireNames = new Set();
                            this.state.cjsRequireModules.set(
                                source,
                                requireNames
                            );
                        }

                        // let {a} = require('a')
                        let objectPatternPath = path.findParent((parent) => {
                            return t.isObjectPattern(parent.node.id);
                        });

                        if (objectPatternPath) {
                            objectPatternPath.node.properties.forEach(
                                (prop) => {
                                    requireNames.add(prop.key);
                                }
                            );
                        } else if (t.isMemberExpression(parentNode)) {
                            // require('a').a
                            let name = getStaticMemberPro(parentNode);

                            // let a = require('a')[a]，属于动态导入
                            if (name === false) {
                                console.warn(
                                    `Dynamic cjsRequireModules are not currently supported: ${path.toString()}. please configure dynamicrequiretargets`
                                );

                                return;
                            }

                            requireNames.add(name);
                        } else if (source) {
                            // require('./a')
                            // 声明语句才有：let a = require('./a')
                            let declaratorParentPath = path.find((path) => {
                                return t.isVariableDeclarator(path);
                            });
                            let name =
                                (declaratorParentPath &&
                                    declaratorParentPath.node.id &&
                                    declaratorParentPath.node.id.name) ||
                                '';
                            let usedNames = [];

                            if (name) {
                                let binding = path.scope.getBinding(name);

                                binding.referencePaths.every((rPath) => {
                                    let {parent} = rPath;

                                    if (!t.isMemberExpression(parent)) {
                                        usedNames = [];
                                        return;
                                    } else {
                                        let proKey = getStaticMemberPro(parent);

                                        if (proKey === false) {
                                            usedNames = [];
                                            return;
                                        }

                                        usedNames.push(proKey);
                                        return true;
                                    }
                                });

                                usedNames = unique(usedNames);
                                usedNames = usedNames.filter(
                                    (n) => n !== 'default'
                                );
                            }

                            if (usedNames.length) {
                                usedNames.forEach((n) => {
                                    requireNames.add(n);
                                });
                            } else {
                                requireNames.add('default');
                            }
                        }
                    }
                },
            },

            ModuleDeclaration: {
                enter: () => {
                    this.state.isESM = true;
                },
            },

            AssignmentExpression: {
                enter: (path) => {
                    let generateExportNode = (path, name) => {
                        let exportName = name;
                        let rightNode = path.node.right;

                        if (t.isIdentifier(rightNode)) {
                            this.state.cjsExportModules.set(
                                exportName,
                                path.find((path) => {
                                    return t.isProgram(path.parentPath);
                                })
                            );
                        } else {
                            let id =
                                path.scope.generateUidIdentifier(exportName);
                            let declaration = t.variableDeclaration('let', [
                                t.variableDeclarator(id, rightNode),
                            ]);

                            path.insertBefore(declaration);

                            let rightPath = path.get('right');
                            rightPath.replaceWith(id);

                            this.state.cjsExportModules.set(
                                exportName,
                                path.find((path) => {
                                    return t.isProgram(path.parentPath);
                                })
                            );
                        }
                    };

                    // Check for module.exports.
                    // 只处理顶级作用域
                    // 只处理纯粹的 exports.a=1 语句
                    // 即不嵌套在任何其他语句中
                    if (
                        t.isMemberExpression(path.node.left) &&
                        t.isProgram(path.scope.path) &&
                        t.isProgram(path.parentPath.parentPath)
                    ) {
                        const moduleBinding = path.scope.getBinding('module');
                        const exportsBinding = path.scope.getBinding('exports');

                        // module.exports.x = 1; 不包含子属性 module.exports.x.y = 1;
                        if (
                            t.isMemberExpression(path.node.left.object) &&
                            path.node.left.object.object.name === 'module'
                        ) {
                            if (moduleBinding) {
                                return;
                            }

                            if (
                                getStaticMemberPro(path.node.left.object) ===
                                'exports'
                            ) {
                                let name = getStaticMemberPro(path.node.left);

                                // 动态导出，不转换
                                if (name === false) {
                                    return;
                                }

                                if (this.ingorekeys.includes(name)) {
                                    return;
                                }

                                this.state.isCJS = true;

                                generateExportNode(path, name);
                            }
                        } else if (path.node.left.object.name === 'exports') {
                            // exports.x = 1; 不包含子属性 exports.x.y = 1;
                            let name = getStaticMemberPro(path.node.left);
                            if (
                                exportsBinding ||
                                // If export is named "default" leave as is.
                                // It is not possible to export "default" as a named export.
                                // e.g. `export.default = 'a'`
                                // 动态导出和默认导出，不转换
                                name === 'default' ||
                                name === false
                            ) {
                                return;
                            }

                            if (this.ingorekeys.includes(name)) {
                                return;
                            }

                            this.state.isCJS = true;

                            generateExportNode(path, name);
                        }
                    }
                },
            },

            MemberExpression: {
                enter: (path) => {
                    if (
                        this.state.isDynamicUsedExportsProperty ||
                        this.state.isUsedExportsObject
                    ) {
                        return;
                    }

                    const moduleBinding = path.scope.getBinding('module');
                    const exportsBinding = path.scope.getBinding('exports');

                    let addUsedExports = () => {
                        let exportsProVal = getStaticMemberPro(path.node);

                        // 动态访问了 exports 上的属性
                        if (exportsProVal === false) {
                            this.state.isDynamicUsedExportsProperty = true;
                            return;
                        }

                        this.state.usedExports.add(exportsProVal);
                    };

                    // 连等情况
                    // let a = exports.x = 1，返回true，不算对x的引用，可直接删除exports.x
                    // let a = exports.x.y = 1, 返回false，算对x的引用，不会删除exports.x
                    let checkIsAssignmentExpressionLeft = () => {
                        let parentPath = path.parentPath;

                        if (!t.isAssignmentExpression(parentPath)) {
                            return false;
                        }

                        let leftPath = parentPath.get('left');
                        return leftPath === path;
                    };

                    // module.exports.x
                    if (
                        t.isMemberExpression(path.node.object) &&
                        path.node.object.object.name === 'module'
                    ) {
                        if (moduleBinding) {
                            return;
                        }

                        if (checkIsAssignmentExpressionLeft()) {
                            return;
                        }

                        let staticModuleProVal = getStaticMemberPro(
                            path.node.object
                        );

                        // 动态访问了module上的属性
                        // 无法确切的知道是否访问了exports属性
                        // 进而无法知道访问了exports的哪些属性
                        if (staticModuleProVal === false) {
                            this.state.isDynamicUsedExportsProperty = true;
                            return;
                        }

                        if (staticModuleProVal !== 'exports') {
                            return;
                        }

                        addUsedExports();
                    } else if (path.node.object.name === 'exports') {
                        // exports.x
                        if (exportsBinding) {
                            return;
                        }

                        if (checkIsAssignmentExpressionLeft()) {
                            return;
                        }

                        addUsedExports();
                    } else if (path.node.object.name === 'module') {
                        // 直接使用 module.exports 对象整体
                        if (moduleBinding) {
                            return;
                        }

                        let staticModuleProVal = getStaticMemberPro(path.node);

                        if (staticModuleProVal !== 'exports') {
                            return;
                        }

                        // module.exports.x 情况
                        // 不算对 module.exports 整体的使用
                        if (t.isMemberExpression(path.parentPath)) {
                            return;
                        }

                        // 到这里该语句一定严格是 module.exports
                        // 判断是否使用
                        if (!that.checkUsed(path)) {
                            return;
                        }

                        this.state.isUsedExportsObject = true;
                    }
                },
            },

            Identifier: {
                enter: (path) => {
                    if (
                        this.state.isDynamicUsedExportsProperty ||
                        this.state.isUsedExportsObject
                    ) {
                        return;
                    }

                    // 直接使用 exports 对象整体
                    if (
                        // 是exports
                        path.node.name === 'exports' &&
                        // 父节点不是对象属性访问，例如：module.exports
                        !t.isMemberExpression(path.parentPath) &&
                        // 作用域无 binding exports
                        !path.scope.getBinding('exports') &&
                        that.checkUsed(path)
                    ) {
                        this.state.isUsedExportsObject = true;
                    }
                },
            },
        });
    }

    // 检查是否赋值给其他变量
    checkUsed(path) {
        let parentPath = path.parentPath;

        // 处于等式左边，且右边不为 Identifier
        // 即语句类似于：exports = {}

        // 且该语句没有赋值给其他语句，例如：
        // let a = exports = {}
        // a = exports = {}
        // {a: exports = {}}
        // [exports = {}] 等等

        // 这里没有去一一判断，而是作了简单处理
        // 判断 exports = {} 的父节点为作用域语句，例如：
        // function(){exports = {}}
        // if(a){exports = {}}
        // 但这会造成漏判，例如：
        // if(exports = {}){}
        // 并没有将 exports 赋值给其他变量，但这里拦截不了
        if (
            t.isAssignmentExpression(parentPath) &&
            parentPath.get('left') === path &&
            !t.isIdentifier(parentPath.get('right')) &&
            // 父节点是赋值语句，且父节点直接在作用域语句中
            t.isScopable(parentPath.parentPath.parentPath)
        ) {
            return false;
        }

        return true;
    }
}

module.exports = {
    TransformCommonJs,
};

// let src = path.resolve(__dirname, './transform-test.js');
// let code = readFile(src);

// console.time('transform');
// let tt = new TransformCommonJs({src, code});
// console.timeEnd('transform');

// const {code: outputCode} = generate(
//     tt.ast,
//     {
//         /* options */
//         decoratorsBeforeExport: true,
//     },
//     code
// );

// writeFile(
//     path.resolve(path.resolve(__dirname, './transform-test-a.js')),
//     outputCode
// );
