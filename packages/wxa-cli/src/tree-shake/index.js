const generate = require('@babel/generator').default;
const {writeFile, dceDeclaration} = require('./util');
let config = require('./config');

let {Graph} = require('./graph');

/**
 * export node 有一个_shake标志，如果该export没有被import，或者被import后没有使用，_shake = 1
 * 在这里，遍历全局文件树，根据import和export关系，对没使用的export进行标记
 * 但如果用require去引入一个export函数变量，这里并不能分析到这个export函数变量被使用过（所以不能去 require 一个 export）
 */

let chain = {};

function shake(dep) {
    if (dep._shook) {
        return;
    }

    let {imports, exports, isRoot, src: depSrc} = dep;

    console.log('---');
    console.log('shake src', depSrc);

    let fileExportChain = [];
    chain[depSrc] = fileExportChain;
    let nameInExport = new Map();

    // let markExport = (fileExportChain) => {
    //     Object.values(fileExportChain).forEach(([name, chainInfo]) => {});
    // };

    let collectExportChain = (dep, childSrc, currentChain) => {
        if (currentChain.length) {
            let nextChain = [];

            let setCurrentChain = (chainNode, childName, path) => {
                let childChainNode = {
                    name: childName,
                    path,
                    children: [],
                    parent: chainNode,
                };
                chainNode.children.push(childChainNode);
                nextChain.push(childChainNode);
                path.$chain
            };

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

            let getExportLocalName = (path) => {
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
                let name = chainNode.name;

                if (defaultLocalName) {
                    localName = defaultLocalName;
                } else {
                    localName = getExportLocalName(path);
                }

                let names = nameInExport.get(path);

                if (names && names.has(localName)) {
                    return;
                }

                if (names) {
                    names.add(localName);
                } else {
                    names = new Set();
                    names.add(localName);
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
                            let localName = getExportLocalName(path);
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
                                let localName = getExportLocalName(path);
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
                    return nextChain.find((chainNode) =>chainNode.name === n);
                });

                collectExportChain(child, src, childChain);
            });
        }
    };

    // if (depSrc.endsWith('ZY\\models\\index.js')) {
    //     console.log('ssssss');
    // }

    Object.entries(imports).forEach(([src, value]) => {
        let usedNames = [];

        Object.entries(value).forEach(([name, path]) => {
            usedNames.push(name);
            fileExportChain.push({
                parent: null,
                name,
                path,
                children: [],
            });
        });

        collectExportChain(dep, src, fileExportChain);
    });

    // 根节点的export语句默认全部保留
    // 所以还需要处理根节点的export语句（export {} from ''）
    // if (isRoot) {
    //     Object.entries(exports).forEach(([src, exportInfo]) => {
    //         if (src !== dep.src) {
    //             let usedNames = [];
    //             Object.entries(exportInfo).forEach(([name]) => {
    //                 usedNames.push(name);
    //             });
    //             collectExportChain(dep, usedNames, src);
    //         }
    //     });
    // }

    dep._shook = true;

    dep.children.forEach((child) => shake(child));
}

function remove(dep) {
    if (dep._removed) {
        return;
    }

    let {topScope, exports, src} = dep;

    let transformCommonJs = dep.transformCommonJs;

    console.log('remove', src);

    // if (src.endsWith('ZY\\models\\applyCenter.model.js')) {
    //     console.log('ss');
    // }

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
        Object.entries(value).forEach(([name, path]) => {
            if (path._shake === 1) {
                if (path.$isCjsExport) {
                    transformCommonJs.deleteCJSExport(name);
                }
                path.remove();
            }
        });
    });

    dceDeclaration(topScope);

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

    let contents = {};
    graph.roots.forEach((root) => {
        remove(root);
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
treeShake([{src: entrySrc}]);
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
