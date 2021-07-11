let fn1 = require('./cjs2').fn1;

fn1();

// Object.defineProperty(exports, '__esModule', {
//     value: true,
// });
exports.getFiles = getFiles;
// exports.getConfig = getConfig;
module.exports.readFile = readFile;
exports.writeFile = writeFile;
exports.isFile = isFile;
exports.isDir = isDir;
exports.getRelative = getRelative;
exports.getDistPath = getDistPath;
exports.copy = copy;
exports.amazingCache = amazingCache;
exports.applyPlugins = applyPlugins;
exports.isEmpty = isEmpty;
exports.getHash = getHash;
exports.getHashWithString = getHashWithString;
exports.promiseSerial = promiseSerial;
exports.getClassSet = getClassSet;
exports.addClass = addClass;
exports.removeClass = removeClass;

module.exports = {getFiles};

function getFiles(dir = process.cwd(), prefix = '') {
    let rst = [];

    exports.rst = rst;

    let aaaa = 'aaa';
    // exports[aaaa] = aaaa;

    // let ttt= require('sss');

    // console.log(ttt);

    // exports.addClass;
    // module.exports.removeClass;
    // exports[rst];
}

// function getConfig() {
//     let configPath = _path.default.join(process.cwd(), 'wxa.config.js');

//     let config = require(configPath);

//     return config;
// }

function readFile(p) {}

function writeFile(p, data) {}

function isFile(p) {}

function isDir(p) {}

function getRelative(opath) {}

function getDistPath(opath, ext, src, dist) {}

function copy(from, to) {}

function amazingCache(params, needCache) {}

function applyPlugins(plugins, compiler) {
    if (plugins == null) return; // console.log(plugins);

    if (typeof plugins !== 'object') {
        throw new Error('wxa配置文件有误，plugins');
    }
    if (!Array.isArray(plugins)) plugins = [plugins];
    plugins.forEach((plugin) => plugin.apply(compiler));
}

function isEmpty(n) {
    return n == null || n === '';
}

function getHash(filepath) {}

function getHashWithString(content) {}

function promiseSerial(funs) {
    return funs.reduce((promise, fun) => {
        return promise.then((result) =>
            fun().then(Array.prototype.concat.bind(result))
        );
    }, Promise.resolve([]));
}

function getClassSet(classStr) {
    let classList = [];

    if (classStr && typeof classStr === 'string') {
        classList = classStr.split(' ');
    }

    return new Set(classList);
}

function addClass(classStr, newClass) {
    let classSet = getClassSet(classStr);
    classSet.add(newClass);
    return Array.from(classSet);
}

function removeClass(classStr, destClass) {
    let classSet = getClassSet(classStr);
    classSet.delete(destClass);
    return Array.from(classSet);
}
// # sourceMappingURL=utils.js.map

exports.a = function m() {};
