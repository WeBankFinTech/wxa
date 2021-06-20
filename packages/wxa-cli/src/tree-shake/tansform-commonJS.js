const traverse = require('@babel/traverse').default;
const generate = require('@babel/generator').default;
let {check} = require('reserved-words');
const {readFile, writeFile, parseESCode} = require('./util');
let t = require('@babel/types');
let path = require('path');

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

function getStaticMemberProValue(node) {
    if (node.computed) {
        return getStaticValue(node.property);
    }

    return node.property.name;
}

class TransformCommonJs {
    state = {
        globalESMImports: new Map(),
        globalESMExports: new Map(),
        renamed: new Map(),
        identifiers: new Set(),
        isCJS: false,
        isESM: false,
        childScopeRequires: new Map(),
        deletedNodes: new Map(),
        usedExports: new Set(),
        isDynamicUsedExportsProperty: false,
    };

    constructor({src, code, ast}) {
        this.src = src;
        this.code = code;
        this.ast = ast || parseESCode(code);

        let dynamicRequireTargets = options.dynamicRequireTargets || [];
        // 如果一个模块被其他模块动态导入
        // 不对这个模块做任何处理
        if (dynamicRequireTargets.includes(src)) {
            return {src, code};
        }

        this.transform(this.ast, options);

        console.log('childScopeRequires', this.state.childScopeRequires);
        console.log('usedExports', this.state.usedExports);
        console.log(
            'isDynamicUsedExportsProperty',
            this.state.isDynamicUsedExportsProperty
        );

        // this.deleteTransformedModuleDeclaration();
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

    deleteTransformedModuleDeclaration() {
        this.state.globalESMImports.forEach((paths, importPath) => {
            importPath.remove();
        });

        this.state.globalESMExports.forEach((paths, exportPath) => {
            exportPath.remove();
        });
    }

    traverseTransformedModuleDeclaration(cb) {
        this.state.globalESMImports.forEach((paths, importPath) => {
            cb(importPath.node);
        });

        this.state.globalESMExports.forEach((paths, exportPath) => {
            cb(exportPath.node);
        });
    }

    deleteCJSExport(esmExportPath) {
        Array.from(this.state.globalESMExports).some(
            ([exportPath, cjsPaths]) => {
                if (this.isChildNode(exportPath.node, esmExportPath.node)) {
                    cjsPaths.forEach((p) => p.remove());
                    return true;
                }
            }
        );
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

    isChildNode(parent, child) {
        if (parent === child) {
            return true;
        }

        let is = false;

        traverse(parent, {
            noScope: true,
            enter(path) {
                let {node} = path;
                if (node === child) {
                    is = true;
                    path.stop();
                }
            },
        });

        return is;
    }

    transform(ast, options = {}) {
        traverse(ast, {
            Program: {
                exit: (path) => {
                    // let allDeletePaths = [];

                    // this.state.globalESMImports.forEach((paths) => {
                    //     allDeletePaths = allDeletePaths.concat(paths);
                    // });

                    // this.state.globalESMExports.forEach((paths) => {
                    //     allDeletePaths = allDeletePaths.concat(paths);
                    // });

                    // allDeletePaths.forEach((path) => {
                    //     let allNextSiblingPaths = path.getAllNextSiblings();

                    //     if (!allNextSiblingPaths.length) {
                    //         this.state.deletedNodes.set(
                    //             path.node,
                    //             path.parentPath
                    //         );
                    //         path.remove();
                    //         return;
                    //     }

                    //     for (let i = 0; i < allNextSiblingPaths.length; i++) {
                    //         let nextPath = allNextSiblingPaths[i];
                    //         let last = i === allNextSiblingPaths.length - 1;
                    //         let find =
                    //             !allDeletePaths.includes(nextPath) || last;

                    //         if (last) {
                    //             nextPath = path.parentPath;
                    //         }

                    //         if (find) {
                    //             this.state.deletedNodes.set(
                    //                 path.node,
                    //                 nextPath
                    //             );
                    //             path.remove();
                    //             break;
                    //         }
                    //     }
                    // });

                    let globalESMImports = new Map();
                    this.state.globalESMImports.forEach((paths, node) => {
                        let importPath = path.unshiftContainer('body', node)[0];
                        this.markNodeDeep(node, '$t_cjs_temp_import');
                        globalESMImports.set(importPath, paths);
                    });
                    this.state.globalESMImports = globalESMImports;

                    let globalESMExports = new Map();
                    this.state.globalESMExports.forEach((paths, node) => {
                        let exportPath = path.pushContainer('body', node)[0];
                        this.markNodeDeep(node, '$t_cjs_temp_export');
                        globalESMExports.set(exportPath, paths);
                    });
                    this.state.globalESMExports = globalESMExports;
                },
            },
            CallExpression: {
                enter: (path) => {
                    const {node} = path;
                    // Look for `require()` any renaming is assumed to be intentionally
                    // done to break state kind of check, so we won't look for aliases.
                    if (
                        t.isIdentifier(node.callee) &&
                        node.callee.name === 'require'
                    ) {
                        // Require must be global for us to consider this a CommonJS
                        // module.
                        this.state.isCJS = true;

                        // Normalize the string value, default to the standard string
                        // literal format of `{ value: "" }`.
                        let source = getStaticValue(node.arguments[0]);

                        if (source === false) {
                            console.warn(
                                `Dynamic requires are not currently supported: ${path.toString()}. please configure dynamicrequiretargets`
                            );

                            return;
                        }

                        const specifiers = [];
                        let {parentPath} = path;
                        let {node: parentNode} = parentPath;

                        let childScopeRequireNames = null;

                        if (!t.isProgram(path.scope.path)) {
                            childScopeRequireNames =
                                this.state.childScopeRequires.get(source);
                            if (!childScopeRequireNames) {
                                childScopeRequireNames = new Set();
                                this.state.childScopeRequires.set(
                                    source,
                                    childScopeRequireNames
                                );
                            }
                        }

                        // Convert to named import.
                        // let {a} = require('a')
                        if (t.isObjectPattern(parentNode.id)) {
                            if (childScopeRequireNames) {
                                parentNode.id.properties.forEach((prop) => {
                                    childScopeRequireNames.add(prop.key);
                                });
                                return;
                            }

                            parentNode.id.properties.forEach((prop) => {
                                specifiers.push(
                                    t.importSpecifier(
                                        t.identifier(prop.value),
                                        t.identifier(prop.key)
                                    )
                                );
                            });
                        } else if (t.isMemberExpression(parentNode)) {
                            // let a = require('a')[a]，属于动态导入
                            if (parentNode.computed) {
                                console.warn(
                                    `Dynamic requires are not currently supported: ${path.toString()}. please configure dynamicrequiretargets`
                                );

                                return;
                            }

                            if (childScopeRequireNames) {
                                childScopeRequireNames.add(
                                    parentNode.property.key
                                );
                                return;
                            }

                            specifiers.push(
                                t.importSpecifier(
                                    t.identifier(parentNode.property.name),
                                    t.identifier(parentNode.property.name)
                                )
                            );
                        } else if (source) {
                            // Convert to default import.
                            if (childScopeRequireNames) {
                                childScopeRequireNames.add('default');
                                return;
                            }

                            let declaratorParentPath = path.find((path) => {
                                return t.isVariableDeclarator(path);
                            });

                            let name =
                                (declaratorParentPath.node.id &&
                                    declaratorParentPath.node.id.name) ||
                                '';
                            let id = name
                                ? t.identifier(name)
                                : path.scope.generateUidIdentifier();

                            // 由 require 转换的 import default 节点
                            // 标记
                            // 当 tree shake 时，对于这类节点：
                            // 1. 这类节点默认在本文件使用
                            // 2. 当找到依赖文件时，依赖文件的 $t_cjs_temp_export（exports 转换的 export 节点）节点默认全部被有效 import
                            let defaultImportNode =
                                t.importDefaultSpecifier(id);

                            this.markNodeDeep(
                                defaultImportNode,
                                '$t_cjs_temp_default_import'
                            );
                            specifiers.push(defaultImportNode);
                        }

                        const importDeclaration = t.importDeclaration(
                            specifiers,
                            t.stringLiteral(source)
                        );

                        this.state.globalESMImports.set(importDeclaration, [
                            path.find((path) => {
                                return t.isProgram(path.parentPath);
                            }),
                        ]);
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
                    if (path.node.$t_ignore) {
                        return;
                    }

                    path.node.$t_ignore = true;

                    let generateExportNode = (path, name) => {
                        let exportName = name;
                        let rightNode = path.node.right;

                        if (t.isIdentifier(rightNode)) {
                            let exportNamedDeclaration =
                                t.exportNamedDeclaration(null, [
                                    t.exportSpecifier(
                                        t.identifier(rightNode.name),
                                        t.identifier(exportName)
                                    ),
                                ]);
                            this.state.globalESMExports.set(
                                exportNamedDeclaration,
                                [
                                    path.find((path) => {
                                        return t.isProgram(path.parentPath);
                                    }),
                                ]
                            );
                        } else {
                            let id =
                                path.scope.generateUidIdentifierBasedOnNode(
                                    rightNode,
                                    exportName
                                );
                            let declaration = t.variableDeclaration('let', [
                                t.variableDeclarator(id, rightNode),
                            ]);
                            let declarationPath =
                                path.insertBefore(declaration)[0];
                            path.scope.registerBinding('let', declarationPath);

                            let rightPath = path.get('right');
                            rightPath.replaceWith(id);

                            let exportNamedDeclaration =
                                t.exportNamedDeclaration(null, [
                                    t.exportSpecifier(
                                        id,
                                        t.identifier(exportName)
                                    ),
                                ]);
                            this.state.globalESMExports.set(
                                exportNamedDeclaration,
                                [
                                    path.find((path) => {
                                        return t.isProgram(path.parentPath);
                                    }),
                                ]
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

                        // Something like `module.exports.namedExport = true;`.
                        if (
                            t.isMemberExpression(path.node.left.object) &&
                            path.node.left.object.object.name === 'module'
                        ) {
                            if (moduleBinding) {
                                return;
                            }

                            this.state.isCJS = true;

                            if (
                                getStaticMemberProValue(
                                    path.node.left.object
                                ) === 'exports'
                            ) {
                                let name = getStaticMemberProValue(
                                    path.node.left
                                );

                                // 动态导出，不转换
                                if (name === false) {
                                    return;
                                }

                                generateExportNode(path, name);
                            }
                        } else if (path.node.left.object.name === 'exports') {
                            // Check for regular exports
                            let name = getStaticMemberProValue(path.node.left);
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

                            this.state.isCJS = true;

                            generateExportNode(path, name);
                        }
                    }
                },
            },

            MemberExpression: {
                enter: (path) => {
                    if (
                        path.node.$t_ignore2 ||
                        this.state.isDynamicUsedExportsProperty
                    ) {
                        return;
                    }

                    path.node.$t_ignore2 = true;

                    const moduleBinding = path.scope.getBinding('module');
                    const exportsBinding = path.scope.getBinding('exports');

                    let addUsedExports = () => {
                        let exportsProVal = getStaticMemberProValue(path.node);

                        // 动态访问了 exports 上的属性
                        if (exportsProVal === false) {
                            this.state.isDynamicUsedExportsProperty = true;
                            return;
                        }

                        this.state.usedExports.add(exportsProVal);
                    };

                    let checkIsAssignmentExpressionLeft = () => {
                        let parentPath = path.parentPath;
                        let leftPath = parentPath.get('left');
                        return leftPath === path;
                    };

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

                        let staticModuleProVal = getStaticMemberProValue(
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
                        if (exportsBinding) {
                            return;
                        }

                        if (checkIsAssignmentExpressionLeft()) {
                            return;
                        }

                        addUsedExports();
                    }
                },
            },
        });
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
