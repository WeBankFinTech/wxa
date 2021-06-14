'use strict';

import _packageJson from "../package.json";
import _crypto2 from "crypto";
import _fsCache2 from "./fs-cache";
import _mkdirp2 from "mkdirp";
import _path2 from "path";
import _fs2 from "fs";
import _chalk2 from "chalk";
import _babelRuntimeHelpersInteropRequireDefault from "@babel/runtime/helpers/interopRequireDefault";
var module = {
  exports: {}
};
var exports = module.exports;
let _interopRequireDefault = _babelRuntimeHelpersInteropRequireDefault;
Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.getFiles = _getFiles; // exports.getConfig = getConfig;

exports.readFile = _readFile;
exports.writeFile = _writeFile;
exports.isFile = _isFile;
exports.isDir = _isDir;
exports.getRelative = _getRelative;
exports.getDistPath = _getDistPath;
exports.copy = _copy;
exports.amazingCache = _amazingCache;
exports.applyPlugins = _applyPlugins;
exports.isEmpty = _isEmpty;
exports.getHash = _getHash;
exports.getHashWithString = _getHashWithString;
exports.promiseSerial = _promiseSerial;
exports.getClassSet = _getClassSet;
exports.addClass = _addClass;
exports.removeClass = _removeClass;

let _chalk = _interopRequireDefault(_chalk2);

let _fs = _interopRequireDefault(_fs2);

let _path = _interopRequireDefault(_path2);

let _mkdirp = _interopRequireDefault(_mkdirp2);

let _fsCache = _interopRequireDefault(_fsCache2);

let _crypto = _interopRequireDefault(_crypto2);

let current = process.cwd();
let pkg = _packageJson;

function _getFiles(dir = process.cwd(), prefix = '') {
  dir = _path.default.normalize(dir);
  let rst = [];
  exports.ttt = 1;

  if (!_fs.default.existsSync(dir)) {
    return rst;
  }

  let files = _fs.default.readdirSync(dir);

  files.forEach(item => {
    let filepath = dir + _path.default.sep + item;

    let stat = _fs.default.statSync(filepath);

    if (stat.isFile()) {
      rst.push(prefix + item);
    } else if (stat.isDirectory()) {
      rst = rst.concat(_getFiles(filepath, _path.default.normalize(prefix + item + _path.default.sep)));
    }
  });
  return rst;
} // function getConfig() {
//     let configPath = _path.default.join(process.cwd(), 'wxa.config.js');
//     let config = require(configPath);
//     return config;
// }


function _readFile(p) {
  let rst = '';
  p = typeof p === 'object' ? _path.default.join(p.dir, p.base) : p;

  try {
    rst = _fs.default.readFileSync(p, 'utf-8');
  } catch (e) {
    rst = null;
  }

  return rst;
}

function _writeFile(p, data) {
  let opath = typeof p === 'string' ? _path.default.parse(p) : p;

  _mkdirp.default.sync(opath.dir);

  _fs.default.writeFileSync(p, data);
}

function _isFile(p) {
  p = typeof p === 'object' ? _path.default.join(p.dir, p.base) : p;
  if (!_fs.default.existsSync(p)) return false;
  return _fs.default.statSync(p).isFile();
}

function _isDir(p) {
  // console.log(isDir, fs.existsSync(p), p);
  if (!_fs.default.existsSync(p)) {
    return false;
  }

  return _fs.default.statSync(p).isDirectory();
}

function _getRelative(opath) {
  return _path.default.relative(current, _path.default.join(opath.dir, opath.base));
}

function _getDistPath(opath, ext, src, dist) {
  let relative;
  opath = typeof opath === 'string' ? _path.default.parse(opath) : opath;
  ext = ext ? ext[0] === '.' ? ext : '.' + ext : opath.ext;

  if (_path.default.relative(current, opath.dir).indexOf('node_modules') === 0) {
    relative = _path.default.relative(_path.default.join(current, 'node_modules'), opath.dir);
    relative = _path.default.join('npm', relative);
  } else {
    relative = _path.default.relative(_path.default.join(current, src), opath.dir);
  }

  return _path.default.join(current, dist, relative, opath.name + ext);
}

function _copy(from, to) {
  return new Promise((resolve, reject) => {
    _mkdirp.default.sync(_path.default.parse(to).dir);

    _fs.default.copyFile(from, to, err => {
      if (err) return reject(err);
      resolve();
    });
  });
}

function _amazingCache(params, needCache) {
  let defaultOpts = {
    directory: true,
    identifier: JSON.stringify({
      '@wxa/cli2': pkg.version,
      'env': process.env.NODE_ENV || 'development'
    })
  };
  let cacheParams = Object.assign({}, defaultOpts, params);

  if (needCache) {
    return (0, _fsCache.default)(cacheParams);
  } else {
    let {
      source,
      transform,
      options
    } = cacheParams;
    return transform(source, options);
  }
}

function _applyPlugins(plugins, compiler) {
  if (plugins == null) return; // console.log(plugins);

  if (typeof plugins !== 'object') {
    throw new Error('wxa配置文件有误，plugins');
  }

  if (!Array.isArray(plugins)) plugins = [plugins];
  plugins.forEach(plugin => plugin.apply(compiler));
}

function _isEmpty(n) {
  return n == null || n === '';
}

function _getHash(filepath) {
  let content = _readFile(filepath);

  return content == null ? Date.now() : _crypto.default.createHash('md5').update(content).digest('hex');
}

function _getHashWithString(content) {
  return content == null ? Date.now() : _crypto.default.createHash('md5').update(content).digest('hex');
}

function _promiseSerial(funs) {
  return funs.reduce((promise, fun) => {
    return promise.then(result => fun().then(Array.prototype.concat.bind(result)));
  }, Promise.resolve([]));
}

function _getClassSet(classStr) {
  let classList = [];

  if (classStr && typeof classStr === 'string') {
    classList = classStr.split(' ');
  }

  return new Set(classList);
}

function _addClass(classStr, newClass) {
  let classSet = _getClassSet(classStr);

  classSet.add(newClass);
  return Array.from(classSet);
}

function _removeClass(classStr, destClass) {
  let classSet = _getClassSet(classStr);

  classSet.delete(destClass);
  return Array.from(classSet);
} // # sourceMappingURL=utils.js.map


export let getFiles = exports.getFiles;
export let readFile = exports.readFile;
export let writeFile = exports.writeFile;
export let isFile = exports.isFile;
export let isDir = exports.isDir;
export let getRelative = exports.getRelative;
export let getDistPath = exports.getDistPath;
export let copy = exports.copy;
export let amazingCache = exports.amazingCache;
export let applyPlugins = exports.applyPlugins;
export let isEmpty = exports.isEmpty;
export let getHash = exports.getHash;
export let getHashWithString = exports.getHashWithString;
export let promiseSerial = exports.promiseSerial;
export let getClassSet = exports.getClassSet;
export let addClass = exports.addClass;
export let removeClass = exports.removeClass;
export let ttt = exports.ttt;
export default module.exports;