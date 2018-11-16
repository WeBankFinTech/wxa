import path from 'path';
import PathParser from '../helpers/pathParser';
import {getDistPath, isFile, readFile, isDir} from '../utils';
import findRoot from 'find-root';
import resolveAlias from '../helpers/alias';
import debugPKG from 'debug';

let debug = debugPKG('WXA:DependencyResolver');

class DependencyResolver {
    constructor(resolve, meta) {
        this.resolve = resolve;
        this.meta = meta;

        this.modulesPath = path.join(this.meta.current, 'node_modules', path.sep);
        this.npmPath = path.join(this.meta.output.path, 'npm', path.sep);

        debug('constructor options %o', this);
    }

    resolveDep(lib, mdl, {needFindExt=false}={}) {
        // let opath = path.parse(mdl.src);

        let ext = '';

        let {pret, source} = this.$resolve(lib, mdl);

        // 处理无后缀情况
        // ext = path.extname(source);
        if (!isFile(source) && !pret.isWXALib) {
            // not support resolve extension.
            if (!needFindExt) throw new Error('文件不存在');

            // start resolve extension
            let pext = this.resolve.extensions.find((ext)=>isFile(source+ext));
            // 非完整后缀的路径
            if (isFile(source+this.meta.wxaExt)) ext = '.js'; // .wxa的文件转js
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
        source = path.resolve(source+ext);
        lib += ext;

        return {
            source,
            pret,
            lib,
        };
    }

    $resolve(lib, mdl) {
        let opath = path.parse(mdl.meta.source);

        let source = '';
        let ext = '';
        // resolve alias;
        if (this.resolve.alias && !mdl.isNpm) lib = resolveAlias(lib, this.resolve.alias, mdl.meta.source);

        let pret = new PathParser().parse(lib);

        debug('%s path pret %o', lib, pret);

        if (pret.isRelative || pret.isAPPAbsolute) {
            source = pret.isAPPAbsolute ? path.join(this.meta.context, lib) : path.join(opath.dir, lib);
        } else if (pret.isNodeModule) {
            source = path.join(this.modulesPath, lib);
            ext = '';
        } else if (pret.isWXALib) {
            // polyfill from wxa cli.
            ext = /\.\w+$/.test(pret.name) ? '' : '.js';
            pret.ext = ext;
            source = path.join(this.meta.libSrc, pret.name+ext);
        } else if (pret.isPlugin || pret.isURI) {
            // url module
            source = lib;
        } else {
            throw new Error('不支持的路径类型'+lib);
        }

        return {lib, source, pret};
    }

    getOutputPath(source, pret, mdl) {
        if (pret.isRelative || pret.isAPPAbsolute || pret.isNodeModule || pret.isWXALib) {
            let opath = pret.isWXALib ?
            path.parse(path.join(this.meta.context, '_wxa', pret.name+pret.ext)) :
            path.parse(source);

            return this.getDistPath(opath);
        } else if (pret.isPlugin || pret.isURI) {
            // url module
            return null;
        } else {
            throw new Error('不支持的路径类型'+mdl.src);
        }
    }

    getResolved(lib, libOutputPath, mdl) {
        // if Plugin resource or remote url do not change resolved path.
        if (libOutputPath == null) return lib;

        let resolved = '';
        // let opath = path.parse(mdl.src);

        let fileOutputPath = (
            mdl.meta &&
            mdl.meta.outputPath ||
            this.getDistPath(path.parse(mdl.src))
        );

        resolved = './'+path.relative(path.parse(fileOutputPath).dir, libOutputPath);

        return resolved.replace(/\\/g, '/');
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

    getDistPath(opath) {
        let relative;
        opath = typeof opath === 'string' ? path.parse(opath) : opath;

        if (path.relative(this.meta.current, opath.dir).indexOf('node_modules') === 0) {
            relative = path.relative(path.join(this.meta.current, 'node_modules'), opath.dir);
            relative = path.join('npm', relative);
        } else {
            relative = path.relative(this.meta.context, opath.dir);
        }

        return path.join(this.meta.output.path, relative, opath.base);
    }
}

export {
    DependencyResolver as default,
};
