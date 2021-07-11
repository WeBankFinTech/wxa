const generate = require('@babel/generator').default;
const {writeFile, dceDeclaration} = require('./util');
let config = require('./config');

let {Graph} = require('./graph');

/**
 * export node 有一个_shake标志，如果该export没有被import，或者被import后没有使用，_shake = 1
 * 在这里，遍历全局文件树，根据import和export关系，对没使用的export进行标记
 * 但如果用require去引入一个export函数变量，这里并不能分析到这个export函数变量被使用过（所以不能去 require 一个 export）
 */

let chains = {};

function shake(dep) {
    if (dep._shook) {
        return;
    }

    let {imports, exports, isRoot, src: depSrc} = dep;

    console.log('---');
    console.log('shake src', depSrc);

    let fileExportChain = [];
    chains[depSrc] = fileExportChain;

    let collectExportChain = (dep, childSrc, currentChain) => {
        if (currentChain.length) {
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
            let nextChain = [];

            let setCurrentChain = (chainNode, childName, path) => {
                let childChainNode = {
                    name: childName,
                    path,
                    children: [],
                    parent: chainNode,
                    dep: child,
                };
                chainNode.children.push(childChainNode);
                nextChain.push(childChainNode);
                path.$chain = {
                    [childName]: childChainNode,
                };
            };

            let getExportLocalName = (path, defaultName) => {
                if (path.$isCjsExport) {
                    return defaultName;
                }

                let local = path.node.local;
                if (local) {
                    return local.name;
                }

                return '*';
            };

            let addUsedExport = (src, name, path) => {
                usedExports[src] = usedExports[src] || {};

                if (name) {
                    usedExports[src][name] = path;
                }
            };

            let collect = (chainNode, path, src, defaultLocalName) => {
                let localName = '';

                if (defaultLocalName) {
                    localName = defaultLocalName;
                } else {
                    localName = getExportLocalName(path);
                }

                if (path.$chain && path.$chain[localName]) {
                    chainNode.children.push(path.$chain[localName]);
                    return;
                }

                setCurrentChain(chainNode, localName, path);
                addUsedExport(src, localName, path);
            };

            let importAllChainNode = currentChain.find(
                (node) => node.name === '*'
            );

            if (importAllChainNode) {
                let importDefaultChainNode = currentChain.find(
                    (node) => node.name === 'default'
                );

                let markedDefalut = false;
                if (localExports) {
                    Object.entries(localExports[1]).forEach(([name, path]) => {
                        if (name === 'default') {
                            if (importDefaultChainNode) {
                                markedDefalut = true;
                                setCurrentChain(
                                    importDefaultChainNode,
                                    'dafault',
                                    path
                                );
                            }
                        } else {
                            let localName = getExportLocalName(path, name);
                            setCurrentChain(
                                importAllChainNode,
                                localName,
                                path
                            );
                        }
                    });
                }

                externalExports.forEach(([src, exportInfo]) => {
                    Object.entries(exportInfo).forEach(([name, path]) => {
                        if (
                            name === 'default' &&
                            importDefaultChainNode &&
                            !markedDefalut
                        ) {
                            collect(importDefaultChainNode, path, src);
                        } else if (name !== 'default') {
                            collect(importAllChainNode, path, src);
                        }
                    });
                });
            } else {
                currentChain.forEach((chainNode) => {
                    let name = chainNode.name;
                    if (localExports) {
                        let path = localExports[1][name];

                        if (path) {
                            if (name === 'default') {
                                setCurrentChain(chainNode, 'dafault', path);
                            } else {
                                let localName = getExportLocalName(path, name);
                                setCurrentChain(chainNode, localName, path);
                            }
                            return;
                        }
                    }

                    externalExports.forEach(([src, exportInfo]) => {
                        let path = exportInfo[name];

                        if (path) {
                            collect(chainNode, path, src);
                        }

                        path = exportInfo['*'];

                        if (path) {
                            collect(chainNode, path, src, name);
                        }
                    });
                });
            }

            Object.entries(usedExports).forEach((src, value) => {
                let childUsedNames = Object.keys(value);
                let childChain = childUsedNames.map((n) => {
                    return nextChain.find((chainNode) => chainNode.name === n);
                });

                collectExportChain(child, src, childChain);
            });
        }
    };

    // if (depSrc.endsWith('ZY\\models\\index.js')) {
    //     console.log('ssssss');
    // }

    Object.entries(imports).forEach(([src, value]) => {
        let currentChain = [];

        Object.entries(value).forEach(([name, path]) => {
            let chainNode = {
                parent: null,
                name,
                path,
                children: [],
                dep,
            };
            fileExportChain.push(chainNode);
            currentChain.push(chainNode);
        });

        collectExportChain(dep, src, currentChain);
    });

    // 根节点的export语句默认全部保留
    // 所以还需要处理根节点的export语句（export {} from ''）
    if (isRoot) {
        Object.entries(exports).forEach(([src, exportInfo]) => {
            if (src !== dep.src) {
                let currentChain = [];

                Object.entries(exportInfo).forEach(([name, path]) => {
                    let chainNode = {
                        parent: null,
                        name,
                        path,
                        children: [],
                        dep,
                    };
                    fileExportChain.push(chainNode);
                    currentChain.push(chainNode);
                });

                collectExportChain(dep, src, currentChain);
            }
        });
    }

    let markExport = () => {
        let visitedChainNodes = [];

        let findLastChainNode = (chainNode) => {
            // 循环依赖
            if (visitedChainNodes.includes(chainNode)) {
                return;
            }

            visitedChainNodes.push(chainNode);

            if (!chainNode.children.length) {
                let exportPath = chainNode.path;
              
                if (exportPath.node && !exportPath.node.source) {
                    visitedChainNodes.forEach((visitedNode, index) => {
                        // 第一个节点是import节点或者root的export节点
                        // 跳过
                        if (index === 0) {
                            return;
                        }

                        let {path} = visitedNode;

                        path.$extReferences.add(visitedChainNodes[0].path);
                    });
                }
            } else {
                chainNode.children.forEach((child) => {
                    findLastChainNode(child);
                });
            }

            visitedChainNodes.pop();
        };

        fileExportChain.forEach((chainNode) => {
            findLastChainNode(chainNode);
        });
    };

    markExport();

    dep._shook = true;
    dep.children.forEach((child) => shake(child));
}

let noReferencedExports = [];

function collectNotReferencedExports(dep) {
    if (dep._colletced) {
        return;
    }

    let {exports, src} = dep;
    console.log('colletced', src);

    // if (src.endsWith('ZY\\models\\applyCenter.model.js')) {
    //     console.log('ss');
    // }

    Object.entries(exports).forEach(([src, value]) => {
        Object.entries(value).forEach(([name, path]) => {
            if (!path.$extReferences.size) {
                noReferencedExports.push({path, dep, name});
            }
        });
    });

    dep._colletced = true;

    dep.children.forEach((child) => collectNotReferencedExports(child));
}

function remove() {
    let visitedChainNodes = [];
    let removeExtReference = (chainNode, importPath) => {
        // 循环依赖
        if (visitedChainNodes.includes(chainNode)) {
            return;
        }

        visitedChainNodes.push(chainNode);
        chainNode.children.forEach((childNode) => {
            childNode.path.$extReferences.delete(importPath);

            if (childNode.path.$extReferences.size === 0) {
                noReferencedExports.push({
                    path: childNode.path,
                    dep: childNode.dep,
                    name: childNode.name,
                });
            }

            removeExtReference(childNode, importPath);
        });
        visitedChainNodes.pop();
    };

    for (let i = 0; i < noReferencedExports.length; i++) {
        const {path: exportPath, dep, name} = noReferencedExports[i];
        let {transformCommonJs, topScope, src} = dep;

        if (exportPath.$isCjsExport) {
            transformCommonJs.deleteCJSExport(name);
        } else {
            exportPath.remove();
        }

        let importPaths = dceDeclaration(topScope);

        if (importPaths.length) {
            let chain = chains[src];

            importPaths.forEach((importPath) => {
                let chainNode = chain.find(
                    (chainNode) => chainNode.path === importPath
                );

                removeExtReference(chainNode, importPath);
            });
        }
    }
}

function output(dep) {
    let contents = {};

    let run = (dep) => {
        let {ast, code, src} = dep;

        if (dep._output) {
            return;
        }

        const {code: outputCode} = generate(
            ast,
            {
                /* options */
                decoratorsBeforeExport: true,
            },
            code
        );

        writeFile(
            path.resolve(path.dirname(src), './shaking', path.basename(src)),
            outputCode
        );

        contents[src] = outputCode;

        dep._output = true;

        dep.children.forEach((child) => {
            run(child);
        });
    };

    run(dep);

    return contents;
}

function setConfig(options) {
    if (
        !options.entry ||
        !Array.isArray(options.entry) ||
        !options.entry.length
    ) {
        throw new Error('Options entry is required');
    }

    config.entry = options.entry;

    if (options.resolveSrc) {
        Object.assign(config.resolveSrc, options.resolveSrc);
    }

    if (options.commonJS) {
        Object.assign(config.commonJS, options.commonJS);
        config.commonJS.ingoreKeys.push('__esModule');
    }

    if (options.parseOptions) {
        if (options.parseOptions.plugins) {
            config.parseOptions.plugins = [
                ...config.parseOptions.plugins,
                ...options.parseOptions.plugins,
            ];

            delete options.parseOptions.plugins;
        }

        config.parseOptions = {
            ...config.parseOptions,
            ...options.parseOptions,
        };
    }
}

function treeShake(options = {}) {
    setConfig(options);

    let graph = new Graph();

    graph.roots.forEach((root) => {
        shake(root);
    });

    console.log('shook');

    graph.roots.forEach((root) => {
        collectNotReferencedExports(root);
    });

    remove();

    let contents = {};
    graph.roots.forEach((root) => {
        contents = {...contents, ...output(root)};
    });

    return contents;
}

module.exports = {
    treeShake,
};

console.time('end');
let path = require('path');
let entrySrc = path.resolve(__dirname, '../../example/index.js');
treeShake({
    entry: [{src: entrySrc}],
    commonJS: {enable: true},
});
console.timeEnd('end');

// function name(params) {
//     console.log(m);
// }

// name();
// const generate = require('@babel/generator').default;
// const traverse = require('@babel/traverse').default;
// const {parse} = require('@babel/parser');
// let code = `exports.x=1;let t =exports`;
// let ast = parse(code, {sourceType: 'unambiguous'});
// traverse(ast, {
//     enter(path) {
//         console.log(path.scope)

//     },
// });

// console.log(generate(
//     ast,
//     {
//         /* options */
//     },
//     code
// ).code);
