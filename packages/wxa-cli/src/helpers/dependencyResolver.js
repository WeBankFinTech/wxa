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

        if (pret.isURI || pret.isDynamic || pret.isBase64) return {pret, source, lib};
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
            else if (pret.isNodeModule) {
                ext = this.$findNodeModuleEntryFile(lib, source);
                if (ext == null) throw new Error('找不到文件 '+lib);
            } else if (isDir(source) && isFile(source+path.sep+'index.js')) ext = path.sep+'index.js';
            else {
                throw new Error('找不到文件 '+lib);
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

    $findNodeModuleEntryFile(lib, source) {
        // 非指定文件的node_modules路径依赖
        let pkg = this.getPkgConfig(lib);
        if (!pkg) {
            throw new Error('找不到模块'+lib);
        }

        let main = pkg.main || 'index.js';
        // 优先使用依赖的 browser 版本
        if (pkg.browser && typeof pkg.browser === 'string') {
            main = pkg.browser;
        }

        return isFile(path.join(source, main)) ? path.sep+main : null;
    }

    $resolve(lib, mdl) {
        let opath = path.parse(mdl.meta.source);

        let source = '';
        let ext = '';
        // resolve alias;
        if (this.resolve.alias && !mdl.isNodeModule) lib = resolveAlias(lib, this.resolve.alias, mdl.meta.source);

        let pret = new PathParser().parse(lib);

        debug('%s path pret %o', lib, pret);

        if (pret.isRelative || pret.isAPPAbsolute) {
            source = pret.isAPPAbsolute ? path.join(this.meta.context, lib) : path.join(opath.dir, lib);
        } else if (pret.isNodeModule) {
            source = path.join(this.modulesPath, lib);
            ext = '';
        } else if (pret.isWXALib) {
            // polyfill from wxa cli.
            // 不返回后缀，避免引入组件报错
            ext = /\.\w+$/.test(pret.name) ? '' : '.js';
            pret.ext = ext;
            source = path.join(this.meta.libSrc, pret.name);
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
            return this.getDistPath(source, mdl);
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
            this.getDistPath(path.parse(mdl.src), mdl)
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

    getDistPath(fullPath, mdl) {
        let relative;
        fullPath = typeof fullPath === 'string' ? path.parse(fullPath) : fullPath;

        if (
            fullPath.dir.indexOf(this.modulesPath) > -1
        ) {
            // node_modules
            relative = path.relative(this.modulesPath, fullPath.dir);
            relative = path.join('npm', relative);
        } else if (
            fullPath.dir.indexOf(this.meta.libSrc) > -1
        ) {
            // cli内置文件
            relative = path.relative(this.meta.libSrc, fullPath.dir);
            relative = path.join('_wxa', relative);
        } else {
            relative = path.relative(this.meta.context, fullPath.dir);
        }

        return path.join(this.meta.output.path, relative, fullPath.base);
    }
}

export {
    DependencyResolver as default,
};
