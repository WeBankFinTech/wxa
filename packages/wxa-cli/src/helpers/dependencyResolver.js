import path from 'path';
import PathParser from '../helpers/pathParser';
import {getDistPath, isFile, readFile, isDir} from '../utils';
import findRoot from 'find-root';
import resolveAlias from '../helpers/alias';
import debugPKG from 'debug';

let debug = debugPKG('DependencyResolver');

class DependencyResolver {
    constructor(resolve, meta) {
        this.resolve = resolve;
        this.meta = meta;

        this.modulesPath = path.join(this.meta.current, 'node_modules', path.sep);
        this.npmPath = path.join(this.meta.current, meta.dist, 'npm', path.sep);

        debug('constructor options %o', this);
    }

    resolveDep(lib, mdl, {needFindExt=false}={}) {
        let opath = path.parse(mdl.src);

        let resolved = lib;
        let target = '';
        let source = '';
        let ext = '';

        // resolve alias;
        if (this.resolve.alias && !mdl.isNpm) lib = resolveAlias(lib, this.resolve.alias, mdl.src);

        let pret = new PathParser().parse(lib);

        if (pret.isRelative || pret.isAPPAbsolute) {
            source = pret.isAPPAbsolute ? path.join(this.meta.src, lib) : path.join(opath.dir, lib);
            if (mdl.isNpm) {
                target = path.join(this.npmPath, path.relative(this.modulesPath, source));
            } else {
                let otarget = path.parse(getDistPath(source, void(0), this.meta.src, this.meta.dist));
                target = otarget.dir+path.sep+otarget.base;
            }
        } else if (pret.isNodeModule) {
            source = path.join(this.modulesPath, lib);
            target = path.join(this.npmPath, lib);
            ext = '';
        } else if (pret.isWXALib) {
            source = path.join(this.meta.current, this.meta.src, '_wxa', pret.name);
            target = path.join(this.meta.current, this.meta.dist, '_wxa', pret.name);
            ext = /\.js$/.test(pret.name) ? '' : '.js';

            return {lib, target: target+ext, source: source+ext};
        } else if (pret.isPlugin || pret.isURI) {
            // url module
            return {lib, target: null, source: lib, pret};
        } else {
            throw new Error('不支持的路径类型'+lib);
        }

        // 处理无后缀情况
        // ext = path.extname(source);
        if (!isFile(source)) {
            // not support resolve extension.
            if (!needFindExt) throw new Error('文件不存在');

            // start resolve extension
            let pext = this.resolve.extensions.find((ext)=>isFile(source+ext));
            // 非完整后缀的路径
            if (isFile(source+this.meta.ext)) ext = '.js'; // .wxa的文件转js
            else if (pext) ext = pext;
            else if (isDir(source) && isFile(source+path.sep+'index.js')) ext = path.sep+'index.js';
            else {
                // 非指定文件的node_modules路径依赖
                let pkg = this.getPkgConfig(lib);
                if (!pkg) {
                    throw new Error('找不到模块'+lib);
                }
                let main = pkg.main || 'index.js';
                if (pkg.browser && typeof pkg.browser === 'string') {
                    main = pkg.browser;
                }
                if (isFile(path.join(source, main))) {
                    ext = path.sep+main;
                } else {
                    throw new Error('找不到文件 '+lib);
                }
            }
        } else {
            ext = '';
        }
        source += ext;
        target += ext;
        lib += ext;

        return {
            target,
            source,
            pret,
            lib,
        };
    }

    getResolved(lib, source, target, mdl) {
        let resolved = '';
        let opath = path.parse(mdl.src);
        let ext = path.extname(source);

        // modify path with lib.
        // always require relative path of file.
        // such as 'redux', expect to be something like this '../../redux/index.js'.
        if (mdl.isNpm) {
            if (lib[0] !== '.') {
                // dependencies from node_modules
                resolved = path.join(path.relative(opath.dir, this.modulesPath), lib);
            } else {
                // relative path
                if (lib[0] === '.' && lib[1] === '.') resolved = './'+resolved;
            }
        } else {
            resolved = path.relative(getDistPath(opath, ext, this.meta.src, this.meta.dist), target).split(path.sep).join('/').replace(/^\.\.\//, './');
        }
        // 转化windowd的\\，修复path, relative需要向上一级目录的缺陷
        resolved = resolved.replace(/\\/g, '/');

        return resolved;
    }

    getPkgConfig(lib) {
        let uri = path.join(this.modulesPath, lib);
        let location = findRoot(uri);
        let content = readFile(path.join(location, 'package.json'));
        try {
            content = JSON.parse(content);
        } catch (e) {
            content = null;
        }

        return content;
    }
}

export {
    DependencyResolver as default,
};
