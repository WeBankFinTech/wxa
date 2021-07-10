let fs = require('fs');
let path = require('path');
let mkdirp = require('mkdirp');
const {parse} = require('@babel/parser');
const t = require('@babel/types');
const traverse = require('@babel/traverse').default;
let findRoot = require('find-root');
let config = require('./config');

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

function isFile(p) {
    p = typeof p === 'object' ? path.join(p.dir, p.base) : p;
    if (!fs.existsSync(p)) return false;
    return fs.statSync(p).isFile();
}

function isDir(p) {
    // console.log(isDir, fs.existsSync(p), p);
    if (!fs.existsSync(p)) {
        return false;
    }

    return fs.statSync(p).isDirectory();
}

function getPkgConfig(npmSrc, lib) {
    let uri = path.join(npmSrc, lib);
    let location = findRoot(uri);
    let content = readFile(path.join(location, 'package.json'));
    try {
        content = JSON.parse(content);
    } catch (e) {
        content = null;
    }

    return content;
}

/**
 * import路径：
 * "./a", "a", "@/a", "/a"
 *
 */

let cwd = process.cwd();
function resolveDepSrc({fileSrc, depSrc, root, alias, npm}) {
    let getDepAbsoulte = (src) => {
        if (isDir(src)) {
            return path.join(src, 'index.js');
        }

        if (!src.endsWith('.js')) {
            return src + '.js';
        }

        return src;
    };

    if (alias) {
        let aliasNames = Object.keys(alias);
        let absoluteSrc = '';
        let matched = aliasNames.some((aliasName) => {
            if (depSrc.startsWith(aliasName + '/')) {
                let aliasSrc = alias[aliasName];

                absoluteSrc = path.resolve(
                    cwd,
                    aliasSrc,
                    depSrc.replace(aliasName, '.')
                );
                return true;
            }
        });

        if (matched) {
            return getDepAbsoulte(absoluteSrc);
        }
    }

    if (depSrc.startsWith('/')) {
        return getDepAbsoulte(path.resolve(cwd, root, depSrc.replace('/', '')));
    }

    if (depSrc.startsWith('./') || depSrc.startsWith('../')) {
        let fileDir = path.dirname(fileSrc);
        return getDepAbsoulte(path.resolve(fileDir, depSrc));
    }

    let npmSrc = path.join(cwd, npm);
    let absoluteSrc = path.join(npmSrc, depSrc);

    if (!absoluteSrc.endsWith('.js')) {
        absoluteSrc += '.js';
    }

    if (isFile(absoluteSrc)) {
        return absoluteSrc;
    }

    let pkg = getPkgConfig(npmSrc, depSrc);

    if (!pkg) {
        throw new Error('找不到模块' + depSrc);
    }

    let main = pkg.main || 'index.js';
    // 优先使用依赖的 browser 版本
    if (pkg.browser && typeof pkg.browser === 'string') {
        main = pkg.browser;
    }

    return getDepAbsoulte(path.join(npmSrc, depSrc, main));
}

function parseESCode(code) {
    return parse(code, config.parseOptions);
}

function isChildNode(parent, child) {
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

function dceDeclaration(scope) {
    let hasRemoved = false;

    // 删除节点并不会自动更新相关binding的referenced等信息
    // 这里是重新收集bindings信息
    scope.crawl();

    let removeObjectPattern = (binding) => {
        let proPath = null;

        traverse(binding.path.node, {
            noScope: true,
            ObjectProperty: {
                enter: (path) => {
                    if (path.node.value === binding.identifier) {
                        proPath = path;
                        path.stop();
                    }
                },
            },
        });

        return proPath;
    };

    let remove = (name, scope, binding) => {
        // console.log(name);
        let removedPath = binding.path;
        let bindingPath = binding.path;

        // let {x: x1} = {x: 1, y2: 2};
        if (t.isVariableDeclarator(bindingPath)) {
            let id = bindingPath.node.id;

            if (t.isObjectPattern(id)) {
                removedPath = removeObjectPattern(binding) || removedPath;
            }
        }

        removedPath.remove();
        scope.removeOwnBinding(name);
        hasRemoved = true;
    };

    Object.entries(scope.bindings).forEach(([name, binding]) => {
        if (binding.referenced) {
            return;
        }

        let bindingPath = binding.path;

        // 类似于let a = function ff(){}
        // ff 是函数内部作用域的binding，ff不应该被删除
        // if (t.isFunctionExpression(bindingPath)) {
        //     return;
        // }

        // // try...catch(e)，e没访问到时不该删除整个catch语句
        // if (t.isCatchClause(bindingPath)) {
        //     return;
        // }

        // // function(a, b) {};
        // // let t = function({dataset: {name, opts={}}}, [asq, ttqw]) {};
        // // 函数的参数
        // if (
        //     t.isFunctionExpression(bindingPath.parentPath) ||
        //     t.isFunctionDeclaration(bindingPath.parentPath)
        // ) {
        //     return;
        // }

        // //  let [zz, xx, cc] = [1, 2, 3];
        // //  let {x: x1} = {x: 1, y2: 2};
        // if (
        //     t.isVariableDeclarator(bindingPath) &&
        //     t.isArrayPattern(bindingPath.node.id)
        // ) {
        //     return;
        // }

        // // 未知
        // if (t.isArrayPattern(bindingPath)) {
        //     return;
        // }

        if (
            // 过滤 let [zz, xx, cc] = [1, 2, 3];
            // 变量声明语句可能有副作用，不能简单去除
            // 例如：let a = obj.x，obj.x 可能有访问器属性。其他连等情况等等
            // (t.isVariableDeclarator(bindingPath) &&
            //     !t.isArrayPattern(bindingPath.node.id)) ||
            t.isClassDeclaration(bindingPath) ||
            t.isFunctionDeclaration(bindingPath) ||
            t.isImportDefaultSpecifier(bindingPath) ||
            t.isImportNamespaceSpecifier(bindingPath) ||
            t.isImportSpecifier(bindingPath)
        ) {
            remove(name, scope, binding);
        }
    });

    // 处理声明之间循环引用
    // 当一个声明未被使用时，那该声明所引用的其他声明不算真正使用
    if (hasRemoved) {
        dceDeclaration(scope);
    }
}

// console.log(
//     resolveDepSrc({
//         fileSrc: path.join(cwd, './src/a.js'),
//         depSrc: '@/b',
//         root: 'src',
//         alias: {
//             '@': path.join(cwd, '/src/xxx'),
//         },
//     })
// );

function unique(ary) {
    return [...new Set(ary)];
}

module.exports = {
    readFile,
    writeFile,
    resolveDepSrc,
    parseESCode,
    dceDeclaration,
    isChildNode,
    unique,
};
