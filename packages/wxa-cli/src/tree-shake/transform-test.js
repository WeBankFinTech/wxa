'use strict';

let _interopRequireDefault = require('@babel/runtime/helpers/interopRequireDefault');

Object.defineProperty(exports, '__esModule', {
    value: true,
});
exports.getFiles = getFiles;
// exports.getConfig = getConfig;
exports.readFile = readFile;
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

let _chalk = _interopRequireDefault(require('chalk'));

let _fs = _interopRequireDefault(require('fs'));

let _path = _interopRequireDefault(require('path'));

let _mkdirp = _interopRequireDefault(require('mkdirp'));

let _fsCache = _interopRequireDefault(require('./fs-cache'));

let _crypto = _interopRequireDefault(require('crypto'));

let current = process.cwd();

let pkg = require('../package.json');

function getFiles(dir = process.cwd(), prefix = '') {
    dir = _path.default.normalize(dir);
    let rst = [];

    exports.ttt= 1;

    if (!_fs.default.existsSync(dir)) {
        return rst;
    }

    let files = _fs.default.readdirSync(dir);

    files.forEach((item) => {
        let filepath = dir + _path.default.sep + item;

        let stat = _fs.default.statSync(filepath);

        if (stat.isFile()) {
            rst.push(prefix + item);
        } else if (stat.isDirectory()) {
            rst = rst.concat(
                getFiles(
                    filepath,
                    _path.default.normalize(prefix + item + _path.default.sep)
                )
            );
        }
    });
    return rst;
}

// function getConfig() {
//     let configPath = _path.default.join(process.cwd(), 'wxa.config.js');

//     let config = require(configPath);

//     return config;
// }

function readFile(p) {
    let rst = '';
    p = typeof p === 'object' ? _path.default.join(p.dir, p.base) : p;

    try {
        rst = _fs.default.readFileSync(p, 'utf-8');
    } catch (e) {
        rst = null;
    }

    return rst;
}

function writeFile(p, data) {
    let opath = typeof p === 'string' ? _path.default.parse(p) : p;

    _mkdirp.default.sync(opath.dir);

    _fs.default.writeFileSync(p, data);
}

function isFile(p) {
    p = typeof p === 'object' ? _path.default.join(p.dir, p.base) : p;
    if (!_fs.default.existsSync(p)) return false;
    return _fs.default.statSync(p).isFile();
}

function isDir(p) {
    // console.log(isDir, fs.existsSync(p), p);
    if (!_fs.default.existsSync(p)) {
        return false;
    }

    return _fs.default.statSync(p).isDirectory();
}

function getRelative(opath) {
    return _path.default.relative(
        current,
        _path.default.join(opath.dir, opath.base)
    );
}

function getDistPath(opath, ext, src, dist) {
    let relative;
    opath = typeof opath === 'string' ? _path.default.parse(opath) : opath;
    ext = ext ? (ext[0] === '.' ? ext : '.' + ext) : opath.ext;

    if (
        _path.default.relative(current, opath.dir).indexOf('node_modules') === 0
    ) {
        relative = _path.default.relative(
            _path.default.join(current, 'node_modules'),
            opath.dir
        );
        relative = _path.default.join('npm', relative);
    } else {
        relative = _path.default.relative(
            _path.default.join(current, src),
            opath.dir
        );
    }

    return _path.default.join(current, dist, relative, opath.name + ext);
}

function copy(from, to) {
    return new Promise((resolve, reject) => {
        _mkdirp.default.sync(_path.default.parse(to).dir);

        _fs.default.copyFile(from, to, (err) => {
            if (err) return reject(err);
            resolve();
        });
    });
}

function amazingCache(params, needCache) {
    let defaultOpts = {
        directory: true,
        identifier: JSON.stringify({
            '@wxa/cli2': pkg.version,
            'env': process.env.NODE_ENV || 'development',
        }),
    };
    let cacheParams = Object.assign({}, defaultOpts, params);

    if (needCache) {
        return (0, _fsCache.default)(cacheParams);
    } else {
        let {source, transform, options} = cacheParams;
        return transform(source, options);
    }
}

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

function getHash(filepath) {
    let content = readFile(filepath);
    return content == null
        ? Date.now()
        : _crypto.default.createHash('md5').update(content).digest('hex');
}

function getHashWithString(content) {
    return content == null
        ? Date.now()
        : _crypto.default.createHash('md5').update(content).digest('hex');
}

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
