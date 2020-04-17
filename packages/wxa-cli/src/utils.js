import chalk from 'chalk';
import fs from 'fs';
import path from 'path';
import mkdirp from 'mkdirp';
import cache from './fs-cache';
import crypto from 'crypto';

let current = process.cwd();
let pkg = require('../package.json');

export function getFiles(dir = process.cwd(), prefix = '') {
    dir = path.normalize(dir);
    let rst = [];
    if (!fs.existsSync(dir)) {
        return rst;
    }
    let files = fs.readdirSync(dir);
    files.forEach((item)=>{
        let filepath = dir + path.sep + item;
        let stat = fs.statSync(filepath);
        if (stat.isFile()) {
            rst.push(prefix + item);
        } else if (stat.isDirectory()) {
            rst = rst.concat(getFiles(filepath, path.normalize(prefix + item + path.sep)));
        }
    });
    return rst;
}

export function getConfig() {
    let configPath = path.join(process.cwd(), 'wxa.config.js');
    let config = require(configPath);

    return config;
}

export function readFile(p) {
    let rst = '';
    p = (typeof p === 'object') ? path.join(p.dir, p.base) : p;
    try {
        rst = fs.readFileSync(p, 'utf-8');
    } catch (e) {
        rst = null;
    }

    return rst;
}

export function writeFile(p, data) {
    let opath = typeof p === 'string' ? path.parse(p) : p;
    mkdirp.sync(opath.dir);
    fs.writeFileSync(p, data);
}

export function isFile(p) {
    p = typeof p === 'object' ? path.join(p.dir, p.base) : p;
    if (!fs.existsSync(p)) return false;
    return fs.statSync(p).isFile();
}

export function isDir(p) {
    // console.log(isDir, fs.existsSync(p), p);
    if (!fs.existsSync(p)) {
        return false;
    }

    return fs.statSync(p).isDirectory();
}

export function getRelative(opath) {
    return path.relative(current, path.join(opath.dir, opath.base));
}

export function getDistPath(opath, ext, src, dist) {
    let relative;
    opath = typeof opath === 'string' ? path.parse(opath) : opath;
    ext = (ext ? (ext[0] === '.' ? ext : ('.'+ext) ) : opath.ext);

    if (path.relative(current, opath.dir).indexOf('node_modules') === 0) {
        relative = path.relative(path.join(current, 'node_modules'), opath.dir);
        relative = path.join('npm', relative);
    } else {
        relative = path.relative(path.join(current, src), opath.dir);
    }

    return path.join(current, dist, relative, opath.name+ext);
}

export function copy(from, to) {
    return new Promise((resolve, reject)=>{
        mkdirp.sync(path.parse(to).dir);

        let readable = fs.createReadStream(from);
        let writeable = fs.createWriteStream(to);
        readable.pipe(writeable);
        readable.on('error', (e)=>{
            reject(e);
        });
        writeable.on('error', (err)=>{
            reject(err);
        });
        writeable.on('finish', ()=>{
            resolve();
        });
    });
}

export function amazingCache(params, needCache) {
    let defaultOpts = {
        directory: true,
        identifier: JSON.stringify({
            '@wxa/cli2': pkg.version,
            'env': process.env.NODE_ENV || 'development',
        }),
    };
    let cacheParams = Object.assign(
        {},
        defaultOpts,
        params,
    );

    if (needCache) {
        return cache(cacheParams);
    } else {
        let {source, transform, options} = cacheParams;
        return transform(source, options);
    }
}

export function applyPlugins(plugins, compiler) {
    if (plugins == null) return;
    // console.log(plugins);
    if (typeof plugins !== 'object') throw new Error('wxa配置文件有误，plugins');
    if (!Array.isArray(plugins)) plugins = [plugins];

    plugins.forEach((plugin)=>plugin.apply(compiler));
}

export function isEmpty(n) {
    return n == null || n === '';
}

export function getHash(filepath) {
    let content = readFile(filepath);

    return content == null ? Date.now() : crypto.createHash('md5').update(content).digest('hex');
}

export function getHashWithString(content) {
    return content == null ? Date.now() : crypto.createHash('md5').update(content).digest('hex');
}

export function promiseSerial(funs) {
    return funs.reduce((promise, fun)=>{
        return promise.then((result)=>fun().then(Array.prototype.concat.bind(result)));
    }, Promise.resolve([]));
}

export function getClassSet(classStr) {
    let classList = [];
    if (classStr && typeof classStr === 'string') {
        classList = classStr.split(' ');
    }
    return new Set(classList);
}
export function addClass(classStr, newClass) {
    let classSet = getClassSet(classStr);
    classSet.add(newClass);
    return Array.from(classSet);
}
export function removeClass(classStr, destClass) {
    let classSet = getClassSet(classStr);
    classSet.delete(destClass);
    return Array.from(classSet);
}
