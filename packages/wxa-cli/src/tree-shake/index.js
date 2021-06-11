const traverse = require('@babel/traverse').default;
const generate = require('@babel/generator').default;

let {writeFile} = require('./util');
let {Graph} = require('./graph');

function collectReferences(dep) {
    if (dep._collcted) {
        return;
    }

    let {ast, scope} = dep;

    let findScope = (node) => {
        let defineScope = scope.findDefiningScope(node.name);
        if (defineScope) {
            defineScope.nodes[node.name].forEach((declarationNode) => {
                // 该声明语句被哪些identifier节点使用过
                declarationNode._usedByNodes.push(node);
            });
        }
    };

    let collect = () => {
        traverse(ast, {
            enter: (path) => {
                let {node} = path;

                if (node._scope) {
                    scope = node._scope;
                }

                // obj.x 类型的属性访问，不算对x变量的使用
                if (node.type === 'MemberExpression') {
                    !node.computed && path.skipKey('property');
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
    };

    collect();
    dep._collcted = true;

    dep.children.forEach((child) => collectReferences(child));
}

/**
 * export node 有一个_shake标志，如果该export没有被import，或者被import后没有使用，_shake = 1
 * 在这里，遍历全局文件树，根据import和export关系，对没使用的export进行标记
 * 但如果用require去引入一个export函数变量，这里并不能分析到这个export函数变量被使用过（所以不能去 require 一个 export）
 */

function shake(dep) {
    if (dep._shook) {
        return;
    }

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

            let hasAll = usedNames.some((name) => name === '*');

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
                            if (node._shake === 1) {
                                node._shake = 0;
                                addUsedExport(src, node);
                            }
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
                            if (node._shake === 1) {
                                node._shake = 0;
                                addUsedExport(src, node);
                            }
                        }
                    });
                });
            }

            if (childSrc.endsWith('store\\configure.js')) {
                console.log('1111');
            }

            Object.entries(usedExports).forEach((src, value) => {
                mark(child, Object.keys(value), src);
            });
        }
    };

    Object.entries(imports).forEach(([src, value]) => {
        let usedNames = [];

        Object.entries(value).forEach(([name, node]) => {
            if (node._usedByNodes && node._usedByNodes.length) {
                usedNames.push(name);
            }
        });
        mark(dep, usedNames, src);
    });

    dep._shook = true;

    dep.children.forEach((child) => shake(child));
}

function remove(dep) {
    if (dep._removed) {
        return;
    }

    let {scope, exports} = dep;
    let loop = true;

    let markRemoved = (node) => {
        node._removed = 1;
        traverse(node, {
            noScope: true,
            enter(path) {
                let {node} = path;
                node._removed = 1;
            },
        });
    };

    let doRemove = (scope) => {
        let {nodes: allNodes} = scope;
        Object.values(allNodes).forEach((nodes) => {
            nodes.forEach((node) => {
                if (node._removed === 1) {
                    return;
                }

                if (
                    (node._usedByNodes.length === 0 &&
                        (node._shake === 1 || node._shake === undefined)) ||
                    (node._usedByNodes.length !== 0 &&
                        node._usedByNodes.every((node) => node._removed))
                ) {
                    loop = true;
                    markRemoved(node);
                }
            });
        });

        scope.children.forEach((childScope) => {
            doRemove(childScope);
        });
    };

    /**
     * 遍历exports，shake 标志表示该节点是否被外部有效的 import（即import的方法变量被使用过）
     * 如果shake=1，表示没有被有效import过
     * _usedByNodes只存在于声明语句上，表示该声明语句被哪些identifier节点使用过。
     * 在导出语句中：
     * 只有类似有name的函数变量（export function a(){} export default function a(){}），这样的导出节点才会有_usedByNodes
     * shake=1且_usedByNodes不存在，表示该export节点即不被外部有效import，也不会被内部使用
     * shake=1且_usedByNodes存在且有值，表示该节点不被外部有效import，但被内部使用
     */
    Object.entries(exports).forEach(([src, value]) => {
        Object.entries(value).forEach(([name, node]) => {
            if (
                node._shake === 1 &&
                (!node._usedByNodes ||
                    (node._usedByNodes && node._usedByNodes.length === 0))
            ) {
                markRemoved(node);
            }
        });
    });

    while (loop) {
        loop = false;
        doRemove(scope);
    }

    dep._removed = true;

    dep.children.forEach((child) => remove(child));
}

function output(dep) {
    let contents = {};

    let run = (dep) => {
        let {ast, code, src} = dep;

        if (dep._output) {
            return;
        }

        traverse(ast, {
            enter(path) {
                let {node} = path;
                if (node._removed === 1) {
                    path.remove();
                }
            },
        });

        const {code: outputCode} = generate(
            ast,
            {
                /* options */
                decoratorsBeforeExport: true,
            },
            code
        );

        // writeFile(
        //     path.resolve(path.dirname(src), './shaking', path.basename(src)),
        //     outputCode
        // );

        contents[src] = outputCode;

        dep._output = true;

        dep.children.forEach((child) => {
            run(child);
        });
    };

    run(dep);

    return contents;
}

function start(entries) {
    let graph = new Graph(entries);

    graph.roots.forEach((root) => {
        collectReferences(root);
    });

    console.log('collected');

    graph.roots.forEach((root) => {
        shake(root);
    });

    console.log('shook');

    let contents = {};
    graph.roots.forEach((root) => {
        remove(root);
        contents = {...contents, ...output(root)};
    });

    return contents;
}

module.exports = {
    start,
};

// console.time('end');
// let entrySrc = path.resolve(__dirname, '../../example/index.js');
// start([entrySrc]);
// console.timeEnd('end');

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
