const path = require('path');
const {parse} = require('@babel/parser');
const traverse = require('@babel/traverse').default;
const {Scope} = require('./scope');
const {readFile} = require('./util');

class Graph {
    constructor(entrySrc) {
        this.entrySrc = entrySrc;
        this.root = this.analysis(entrySrc);
    }

    getAbsolutePath(baseSrc, relativeSrc) {
        return path.resolve(path.dirname(baseSrc), relativeSrc);
    }

    getExpSrc(node, src) {
        let expSrc = '';

        if (node.source) {
            expSrc = this.getAbsolutePath(src, node.source.value + '.js');
        } else {
            expSrc = src;
        }

        return expSrc;
    }

    collectDeclaration(path, scope) {
        function addToScope(node, attr, isBlockDeclaration = false) {
            let identifierNode = node[attr];

            // 类似于export default function(){}
            if (!identifierNode || !identifierNode.name) {
                return;
            }

            identifierNode._skip = true;

            node._usedByNodes = [];
            scope.add(node, identifierNode.name, isBlockDeclaration);
        }

        let {node} = path;
        let childScope;

        switch (node.type) {
            // 函数声明 function a(){}
            case 'FunctionDeclaration':
                childScope = new Scope({
                    parent: scope,
                    block: false,
                });
                addToScope(node, 'id', false);
            // 箭头函数 ()=>{}
            case 'ArrowFunctionExpression':
            // 函数表达式 function(){}
            case 'FunctionExpression':
                childScope = new Scope({
                    parent: scope,
                    block: false,
                });
                break;
            // 块级作用域{}
            case 'BlockStatement':
                childScope = new Scope({
                    parent: scope,
                    block: true,
                });
                break;
            // 变量声明
            case 'VariableDeclaration':
                node.declarations.forEach((variableDeclarator) => {
                    if (node.kind === 'let' || node.kind === 'const') {
                        addToScope(variableDeclarator, 'id', true);
                    } else {
                        addToScope(variableDeclarator, 'id', false);
                    }
                });
                break;
            // 类的声明
            case 'ClassDeclaration':
                addToScope(node, 'id', true);
                break;
            // import 的声明
            case 'ImportDeclaration':
                node.specifiers.forEach((specifier) => {
                    addToScope(specifier, 'local', true);
                });
                break;
        }

        return childScope;
    }

    collectImport(path) {
        let {node} = path;
        let importInfo = null;

        switch (node.type) {
            // import 的声明
            case 'ImportDeclaration':
                importInfo = {};
                node.specifiers.forEach((specifier) => {
                    let name = specifier.imported && specifier.imported.name;
                    if (!name) {
                        if (specifier.type === 'ImportDefaultSpecifier') {
                            name = 'default';
                        } else if (
                            specifier.type === 'ImportNamespaceSpecifier'
                        ) {
                            name = '*';
                        }
                    }
                    importInfo[name] = specifier;
                });
                break;
        }

        return importInfo;
    }

    collectExport(path) {
        let {node} = path;
        let exportInfo = null;

        let markShakingFlag = (node) => {
            node._shake = 1;
        };

        switch (node.type) {
            // export 的声明
            case 'ExportNamedDeclaration':
                exportInfo = {};
                if (node.specifiers && node.specifiers.length) {
                    node.specifiers.forEach((specifier) => {
                        let name = specifier.exported.name;
                        exportInfo[name] = specifier;
                        markShakingFlag(specifier);
                    });
                } else {
                    let declaration = node.declaration;

                    if (declaration.type === 'FunctionDeclaration') {
                        let name = declaration.id.name;
                        exportInfo[name] = declaration;
                        declaration._shake = 1;
                        markShakingFlag(declaration);
                    } else if (declaration.type === 'VariableDeclaration') {
                        declaration.declarations.forEach(
                            (variableDeclarator) => {
                                let name = variableDeclarator.id.name;
                                exportInfo[name] = variableDeclarator;
                                markShakingFlag(variableDeclarator);
                            }
                        );
                    } else if (declaration.type === 'ClassDeclaration') {
                        let name = declaration.id.name;
                        exportInfo[name] = declaration;
                        markShakingFlag(declaration);
                    }
                }
                break;
            case 'ExportDefaultDeclaration':
                exportInfo = {};
                exportInfo.default = node;
                markShakingFlag(node);
                break;
            case 'ExportAllDeclaration':
                exportInfo = {};
                exportInfo['*'] = node;
                markShakingFlag(node);
                break;
        }

        return exportInfo;
    }

    analysis(src) {
        let imports = {};
        let exports = {};
        let code = readFile(src);
        let ast = parse(code, {
            sourceType: 'unambiguous',
            plugins: ['classProperties'],
        });

        let scope = new Scope();

        traverse(ast, {
            enter: (path) => {
                let {node} = path;

                let childScope = this.collectDeclaration(path, scope);
                if (childScope) {
                    node._scope = childScope;
                    scope = childScope;
                }

                let importInfo = this.collectImport(path);
                if (importInfo) {
                    let impSrc = this.getAbsolutePath(
                        src,
                        node.source.value + '.js'
                    );
                    imports[impSrc] = imports[impSrc] || {};
                    imports[impSrc] = {...imports[impSrc], ...importInfo};
                }

                let exportInfo = this.collectExport(path);
                if (exportInfo) {
                    let expSrc = this.getExpSrc(node, src);
                    exports[expSrc] = exports[expSrc] || {};
                    exports[expSrc] = {...exports[expSrc], ...exportInfo};
                }
            },

            // 退出节点
            exit(path) {
                let {node} = path;
                if (node._scope) {
                    scope = scope.parent;
                }
            },
        });

        // console.log(src);
        // console.log('imports', imports);
        // console.log('exports', exports);

        // import * 和 export * 不包括default
        // export * from '' 和 export 本文件冲突，export 本文件优先级更高
        // export * from '' 互相冲突，后export * from '' 优先
        // export {} from ''， 从其他文件导出，导出的变量无法在本文件使用
        // export default function(){}，导出的函数没有name，不能在本文件使用
        /**
         * imports: {
         *      [路径]: {
         *          [name]: ImportSpecifier,
         *          default: ImportDefaultSpecifier,
         *          *: ImportNamespaceSpecifier
         *      }
         * }
         *
         * exports: {
         *      [本文件路径]: {
         *          // export function(){}
         *          [name]: FunctionDeclaration|VariableDeclaration|ClassDeclaration
         *          // export default function(){} | export default{} | export {a as default} | export default a
         *          default: ExportDefaultDeclaration | ExportSpecifier,
         *          // export {a as aaa,b,c}
         *          [name]: ExportSpecifier
         *      },
         *      [其他路径]: {
         *          // export {a as aaa,b,c} from '' | export * as all from ''
         *          [name]: ExportSpecifier
         *          // export {default} from '' | export {a as default} from '' | export * as default from ''
         *          default: ExportSpecifier,
         *          // export * from ''
         *          *: ExportAllDeclaration
         *      },
         * }
         */

        let dep = {
            src,
            code,
            ast,
            imports,
            exports,
            children: [],
            scope,
        };

        Object.keys(dep.imports).forEach((childSrc, index) => {
            dep.children.push(this.analysis(childSrc));
        });

        // export {} from './a' a 文件也是子节点
        Object.keys(dep.exports).forEach((childSrc, index) => {
            if (childSrc !== src) {
                dep.children.push(this.analysis(childSrc));
            }
        });

        return dep;
    }
}

module.exports = {
    Graph,
};
