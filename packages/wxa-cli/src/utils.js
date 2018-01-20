import fs from 'fs';
import path from 'path';
import mkdirp from 'mkdirp';
import cache from './fs-cache';

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

export function copy(opath, ext, src, dist) {
    let target = getDistPath(opath, ext, src, dist);
    writeFile(target, readFile(path.join(opath.dir, opath.base)));
    let readable = fs.createReadStream(path.join(opath.dir, opath.base));
    let writeable = fs.createWriteStream(target);
    readable.pipe(writeable);
}

export function encode(content, start, end) {
    start = start || 0;
    end = end || content.length;

    let buffer = [];
    let pmap = ['<', '&', '"'];
    let amap = ['&lt;', '&amp;', '&quot;'];

    for (let i=0, len=content.length; i < len; i++) {
        if (i < start || i > end) {
            buffer.push(content[i]);
        } else {
            let idx = pmap.indexOf(content[i]);
            buffer.push(idx === -1 ? content[i] : amap[idx]);
        }
    }

    return buffer.join('');
}

export function decode(content) {
    let pmap = ['<', '&', '"'];
    let amap = ['&lt;', '&amp;', '&quot;'];
    let reg = new RegExp(`(${amap[0]}|${amap[1]}|${amap[2]})`, 'ig');
    return content.replace(reg, (match, m) => {
        return pmap[amap.indexOf(m)];
    });
}

export function error(msg) {
    console.error(msg);
}

export function info(msg) {
    console.info(msg);
}

export function warn(msg) {
    console.warn(msg);
}

export function amazingCache(params) {
    let defaultOpts = {
        directory: true,
        identifier: JSON.stringify({
            '@webank/wxa-cli': pkg.version,
            'env': process.env.NODE_ENV || 'development',
        }),
    };
    return cache({...defaultOpts, ...params});
}
