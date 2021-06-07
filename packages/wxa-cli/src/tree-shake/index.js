let fs = require('fs');
let path = require('path');
let mkdirp = require('mkdirp');
const {parse} = require('@babel/parser');
const traverse = require('@babel/traverse').default;
const generate = require('@babel/generator').default;
const t = require('@babel/types');

function readFile(p) {
    let rst = '';
    p = typeof p === 'object' ? path.join(p.dir, p.base) : p;
    try {
        rst = fs.readFileSync(p, 'utf-8');
    } catch (e) {
        rst = null;
    }

    return rst;
}

function writeFile(p, data) {
    let opath = typeof p === 'string' ? path.parse(p) : p;
    mkdirp.sync(opath.dir);
    fs.writeFileSync(p, data);
}

class Scope {
    constructor(options) {
        options = options || {};

        this.parent = options.parent;
        this.depth = this.parent ? this.parent.depth + 1 : 0;
        this.names = options.params || [];
        this.nodes = {};
        this.isBlockScope = !!options.block;
        this.children = [];
        if (this.parent) {
            this.parent.children.push(this);
        }
    }
    // 添加变量名
    // isBlockDeclaration 是否是块级声明：let const class import
    add(node, name, isBlockDeclaration) {
        if (!isBlockDeclaration && this.isBlockScope) {
            // it's a `var` or function declaration, and this
            // is a block scope, so we need to go up
            this.parent.add(node, name, isBlockDeclaration);
        } else {
            this.names.push(name);
            // 变量名可能重复，两个var声明同一变量
            if (this.nodes[name]) {
                this.nodes[name].push(node);
            } else {
                this.nodes[name] = [node];
            }
        }
    }

    contains(name) {
        return !!this.findDefiningScope(name);
    }

    findDefiningScope(name) {
        if (this.names.includes(name)) {
            return this;
        }

        if (this.parent) {
            return this.parent.findDefiningScope(name);
        }

        return null;
    }
}

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

    markShakingFlag(node) {
        node._shake = 1;
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

        traverse(ast, {
            enter: (path) => {
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

                        let impSrc = this.getAbsolutePath(
                            src,
                            node.source.value + '.js'
                        );
                        imports[impSrc] = imports[impSrc] || {};
                        node.specifiers.forEach((specifier) => {
                            let name =
                                specifier.imported && specifier.imported.name;
                            if (!name) {
                                if (
                                    specifier.type === 'ImportDefaultSpecifier'
                                ) {
                                    name = 'default';
                                } else if (
                                    specifier.type ===
                                    'ImportNamespaceSpecifier'
                                ) {
                                    name = '*';
                                }
                            }
                            imports[impSrc][name] = specifier;
                        });
                        break;
                    // export 的声明
                    case 'ExportNamedDeclaration':
                        let expSrc = this.getExpSrc(node, src);

                        exports[expSrc] = exports[expSrc] || {};

                        if (node.specifiers && node.specifiers.length) {
                            node.specifiers.forEach((specifier) => {
                                let name = specifier.exported.name;
                                exports[expSrc][name] = specifier;
                                this.markShakingFlag(specifier);
                            });
                        } else {
                            let declaration = node.declaration;

                            if (declaration.type === 'FunctionDeclaration') {
                                let name = declaration.id.name;
                                exports[expSrc][name] = declaration;
                                declaration._shake = 1;
                                this.markShakingFlag(declaration);
                            } else if (
                                declaration.type === 'VariableDeclaration'
                            ) {
                                declaration.declarations.forEach(
                                    (variableDeclarator) => {
                                        let name = variableDeclarator.id.name;
                                        exports[expSrc][name] =
                                            variableDeclarator;
                                        this.markShakingFlag(
                                            variableDeclarator
                                        );
                                    }
                                );
                            } else if (
                                declaration.type === 'ClassDeclaration'
                            ) {
                                let name = declaration.id.name;
                                exports[expSrc][name] = declaration;
                                this.markShakingFlag(declaration);
                            }
                        }
                        break;
                    case 'ExportDefaultDeclaration':
                        exports[src] = exports[src] || {};
                        exports[src].default = node;
                        this.markShakingFlag(node);
                        break;
                    case 'ExportAllDeclaration':
                        let exportSrc = this.getExpSrc(node, src);
                        exports[exportSrc] = exports[exportSrc] || {};
                        exports[exportSrc]['*'] = node;
                        this.markShakingFlag(node);
                        break;
                }

                if (childScope) {
                    node._scope = childScope;
                    scope = childScope;
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

        function findScope(node) {
            let defineScope = scope.findDefiningScope(node.name);
            if (defineScope) {
                defineScope.nodes[node.name].forEach((declarationNode) => {
                    declarationNode._usedByNodes.push(node);
                });
            }
        }

        traverse(ast, {
            enter: (path) => {
                let {node} = path;

                if (node._scope) {
                    scope = node._scope;
                }

                // obj.x 类型的属性访问，不算对x变量的使用
                if (node.type === 'MemberExpression') {
                    !node.computed && path.skip();
                } else if (node.type === 'ObjectProperty') {
                    // {x:1} 对象属性
                    !node.computed && path.skipKey('key');
                } else if (
                    [
                        'ClassMethod',
                        'ClassPrivateMethod',
                        'ClassProperty',
                        'ClassDeclaration',
                    ].includes(node.type)
                ) {
                    !node.computed && path.skipKey('key');
                } else if (node.type === 'Identifier') {
                    // TODO，怎么才算变量已经使用
                    // 这里的判断不准确，无法判断类似函数a引用函数b，但a并没有没使用到
                    // 这里只会去除掉函数a，去除不了函数b
                    !node._skip && findScope(node);
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
        // export default function(){}，导出的函数没有name，不能再本文件使用
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

        // TODO，只是imports节点不准确
        // export {} from './a' a 文件也是子节点
        Object.keys(dep.imports).forEach((childSrc, index) => {
            dep.children[index] = this.analysis(childSrc);
        });

        return dep;
    }
}

/**
 * export node 有一个_shake标志，如果该export没有被import，或者被import后没有使用，_shake = 1
 * 输出时，判断export node 的_shake，当等于1时，遍历子节点，看是否有声明节点，如果声明节点未被引用才可以shake掉
 *
 */

function shake(dep) {
    let imports = dep.imports;

    let mark = (dep, usedNames, childSrc) => {
        if (usedNames.length) {
            let child = dep.children.find((child) => child.src === childSrc);
            let exportsArray = Object.entries(child.exports);
            let localIndex = exportsArray.findIndex(
                ([src]) => src == child.src
            );
            let localExports = null;
            let externalExports = [...exportsArray];
            if (localIndex !== -1) {
                localExports = externalExports.splice(localIndex, 1)[0];
            }

            let hasAll = usedNames.some((name) => name === '*');
            let usedExports = {};
            let addUsedExport = (src, node) => {
                usedExports[src] = usedExports[src] || {};
                let local = node.local;
                if (local) {
                    usedExports[src][local.name] = node;
                } else {
                    usedExports[src]['*'] = node;
                }
            };
            if (hasAll) {
                let hasDefalut = usedNames.some((name) => name === 'default');
                let markedDefalut = false;
                if (localExports) {
                    Object.entries(localExports[1]).forEach(([name, node]) => {
                        if (name === 'default') {
                            if (hasDefalut) {
                                node._shake = 0;
                                markedDefalut = true;
                            }
                        } else {
                            node._shake = 0;
                        }
                    });
                }

                externalExports.forEach(([src, value]) => {
                    Object.entries(value).forEach(([name, node]) => {
                        if (
                            (name === 'default' &&
                                hasDefalut &&
                                !markedDefalut) ||
                            name !== 'default'
                        ) {
                            node._shake = 0;
                            addUsedExport(src, node);
                        }
                    });
                });
            } else {
                usedNames.forEach((name) => {
                    if (localExports) {
                        let node = localExports[1][name];
                        if (node) {
                            node._shake = 0;
                            return;
                        }
                    }

                    externalExports.forEach(([src, value]) => {
                        let node = value[name] || value['*'];
                        if (node) {
                            node._shake = 0;
                            addUsedExport(src, node);
                        }
                    });
                });
            }

            Object.entries(usedExports).forEach((src, value) => {
                mark(child, Object.keys(value), src);
            });
        }
    };

    Object.entries(imports).forEach(([src, value], index) => {
        let usedNames = [];

        Object.entries(value).forEach(([name, node]) => {
            if (node._usedByNodes && node._usedByNodes.length) {
                usedNames.push(name);
            }
        });
        mark(dep, usedNames, src);
    });

    dep.children.forEach((child) => shake(child));
}

function remove(dep) {
    let {ast, scope, code, src, exports} = dep;
    let loop = true;
    let doRemove = (scope) => {
        let {nodes: allNodes} = scope;
        Object.values(allNodes).forEach((nodes) => {
            nodes.forEach((node) => {
                if (node._removed === 1) {
                    return;
                }

                if (t.isClassDeclaration(node)) {
                    console.log('--------------');
                    console.log(node._usedByNodes[0]);
                }

                if (
                    (node._usedByNodes.length === 0 &&
                        (node._shake === 1 || node._shake === undefined)) ||
                    (node._usedByNodes.length !== 0 &&
                        node._usedByNodes.every(
                            (node) => node._removed || node._shake === 1
                        ))
                ) {
                    node._removed = 1;
                    loop = true;

                    traverse(node, {
                        noScope: true,
                        enter(path) {
                            let {node} = path;
                            node._removed = 1;
                        },
                    });
                }
            });
        });

        scope.children.forEach((childScope) => {
            doRemove(childScope);
        });
    };

    while (loop) {
        Object.entries(exports).forEach(([src, value]) => {
            Object.entries(value).forEach(([name, node]) => {
                if (
                    node._shake === 1 &&
                    (!node._usedByNodes ||
                        (node._usedByNodes && node._usedByNodes.length === 0))
                ) {
                    traverse(node, {
                        noScope: true,
                        enter(path) {
                            let {node} = path;
                            node._shake = 1;
                        },
                    });
                } else {
                    node._shake = 0;
                }
            });
        });
        loop = false;
        doRemove(scope);
    }

    dep.children.forEach((child) => remove(child));
}

function run(dep) {
    let {ast, code, src} = dep;

    traverse(ast, {
        enter(path) {
            let {node} = path;
            if (
                node._removed === 1 ||
                (!node._usedByNodes && node._shake === 1)
            ) {
                path.remove();
            }
        },
    });

    const output = generate(
        ast,
        {
            /* options */
        },
        code
    );

    writeFile(
        path.resolve(path.dirname(src), './shaking', path.basename(src)),
        output.code
    );

    dep.children.forEach((child) => {
        run(child);
    });
}

console.time('end');
let entrySrc = path.resolve(__dirname, '../../example/index.js');
let graph = new Graph(entrySrc);
shake(graph.root);
remove(graph.root);
run(graph.root);
console.timeEnd('end');

// function name(params) {
//     console.log(m);
// }

// name();

// let code = `function scopeOnce() {
//     var ref = "This is a binding";
//     var xx = 'binding2'

//     if(xx){
//         let oo="binding3"
//     }

//     ref + '1'; // This is a reference to a binding

//     function scopeTwo() {
//       ref+'2'; // This is a reference to a binding from a lower scope
//     }
//   }`;
// let ast = parse(code, {sourceType: 'unambiguous'});
// traverse(ast, {
//     enter(path) {
//         let {node} =path;
//         if (node.type === 'VariableDeclarator') {
//             console.log(path.scope);
//         }
//     },
// });

// console.log(generate(
//     ast,
//     {
//         /* options */
//     },
//     code
// ).code);
