import traverse from '@babel/traverse';
import * as t from '@babel/types';
import path from 'path';
import PathParser from '../helpers/pathParser';
import {getDistPath, isFile, readFile, isDir} from '../utils';
import findRoot from 'find-root';

export default class ASTManager {
    constructor(resolve, meta) {
        this.resolve = resolve;

        this.current = process.cwd();

        this.modulesPath = path.join(this.current, 'node_modules', path.sep);
        this.npmPath = path.join(this.current, meta.dist, 'npm', path.sep);

        // this.localPath = path.join(this.current, meta.dist, 'local', path.sep);
        // this.localVisualPath = path.join(this.current, 'local', path.sep);
    }

    parse(mdl) {
        if (mdl.ast == null) return [];

        let libs = [];
        traverse(mdl.ast, {
            CallExpression(path) {
                // commandJS module
                if (
                    path.node.callee &&
                    path.node.callee.name === 'require' &&
                    path.node.arguments.length
                ) {
                    let dep = path.node.arguments[0].value;

                    let {resolved, source, pret} = this.resolveDep(dep, mdl);

                    libs.push({
                        absPath: source,
                        pret,
                    });

                    path.replaceWithSourceString(`require(${resolved})`);
                }
            },
            ImportDeclaration(path) {
                // es module
                if (
                    path.node.source &&
                    path.node.source.value
                ) {
                    let dep = path.node.source.value;

                    let {resolved, source, pret, target} = this.resolveDep(dep, mdl);

                    libs.push({
                        absPath: source,
                        pret,
                        target,
                    });

                    // replace source node
                    path.get('source').replaceWith(t.stringLiteral(resolved));
                }
            },
        });

        return libs;
    }

    resolveDep(lib, mdl) {
        let opath = path.parse(mdl.src);

        let resolved = lib;
        let target = '';
        let source = '';
        let ext = '';

        // resolve alias;
        if (this.resolve.alias && !mdl.isNpm) {
            Object.keys(this.alias).forEach((key)=>{
                let value = this.alias[key];
                let aliasReg = new RegExp(`(^${key}$)|(^${key}\/.*$)`, 'gm');
                if (aliasReg.test(lib)) {
                    let tar = lib.replace(new RegExp(key, 'g'), value);
                    let otar = path.parse(tar);
                    // calc relative path base cwd;
                    tar = path.join(path.relative(tar, opath.dir), otar.base);
                    lib = tar.split(path.sep).join('/').replace(/^\.\.\//, './');
                }
            });
        }

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
        } else {
            throw new Error('不支持的路径类型'+lib);
        }

        // 处理无后缀情况
        // ext = path.extname(source);
        if (!isFile(source)) {
            // 解析拓展
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
        resolved = lib;

        // 路径修正
        if (mdl.isNpm) {
            if (lib[0] !== '.') {
                // 依赖第三方包
                // 手动添加../ 下面会删除，
                resolved = path.join(path.relative(opath.dir, this.modulesPath), lib);
            } else {
                // console.log(lib);
                if (lib[0] === '.' && lib[1] === '.') resolved = './'+resolved;
            }
        } else {
            resolved = path.relative(getDistPath(opath, 'js', this.src, this.dist), target).split(path.sep).join('/').replace(/^\.\.\//, './');
        }
        // 转化windowd的\\，修复path, relative需要向上一级目录的缺陷
        resolved = resolved.replace(/\\/g, '/');

        return {
            resolved,
            target,
            source,
            pret,
        };
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
