let fs = require('fs');
let path = require('path');
let mkdirp = require('mkdirp');
const {parse} = require('@babel/parser');
let findRoot = require('find-root');

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
function resolveDepSrc({fileSrc, depSrc, root, alias}) {
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

    let npmSrc = path.join(cwd, 'node_modules');
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

function parseESCode(code, plugins = [], options) {
    plugins = [
        ['decorators', {decoratorsBeforeExport: true}],
        'classProperties',
        'jsx',
        'typescript',
        'exportNamespaceFrom',
        'exportDefaultFrom',
        'objectRestSpread',
        ...plugins,
    ];

    return parse(code, {
        plugins,
        sourceType: 'unambiguous',
        ...options,
    });
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

module.exports = {
    readFile,
    writeFile,
    resolveDepSrc,
    parseESCode,
};
