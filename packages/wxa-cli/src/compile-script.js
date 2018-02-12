import path from 'path';
import {readFile, getDistPath, error, writeFile, isFile, isDir, getConfig, amazingCache, info} from './utils';
import {Base64} from 'js-base64';
import {Tapable, AsyncSeriesHook} from 'tapable';
import findRoot from 'find-root';
import schedule from './schedule';
import CompilerLoader from './compilers/index';
const pkg = require('../package.json');

const pkgReg = /^([\w\-\_\d@\.]*\/?)+$/;

export default class CScript {
    constructor(src, dist, ext) {
        // super();
        this.hooks = {
            optimizeAssets: new AsyncSeriesHook(['code', 'compilation']),
        };
        this.schedule = [];
        this.type = 'js';
        this.current = process.cwd();
        this.src = src;
        this.dist = dist;
        this.ext = ext;
        this.code = '';
        let configs = getConfig();
        this.alias = configs.resolve && configs.resolve.alias || {};
        this.extensions = configs.resolve && configs.resolve.extensions || ['.js', '.json'];
        this.modulesPath = path.join(this.current, 'node_modules', path.sep);
        this.npmPath = path.join(this.current, dist, 'npm', path.sep);
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

    resolveDeps(code, type, opath) {
        return code.replace(/require\(['"]([\w\d_\-\.\/@]+)['"]\)/ig, (match, lib)=>{
            let resolved = lib;
            let target = '', source = '', ext = '', needCopy = false;

            // resolve alias;
            if (this.alias && type !== 'npm') {
                Object.keys(this.alias).forEach((key)=>{
                    let value = this.alias[key];
                    let aliasReg = new RegExp(`(^${key}$)|(^${key}\/.*$)`, 'gm');
                    if (aliasReg.test(lib)) {
                        // console.log('find alias');
                        let tar = lib.replace(new RegExp(key, 'g'), value);
                        let otar = path.parse(tar);
                        tar = path.join(path.relative(tar, opath.dir), otar.base);
                        lib = tar.replace(/\\/g, '/').replace(/\.\.\//, './');
                    }
                });
            }

            if (lib[0] === '.') { // require('./a/b/c)' require('..')
                source = path.join(opath.dir, lib);
                if (type === 'npm') {
                    target = path.join(this.npmPath, path.relative(this.modulesPath, source));
                    needCopy = true;
                } else {
                    let otarget = path.parse(getDistPath(source, '.js', this.src, this.dist));
                    target = otarget.dir+path.sep+otarget.name;
                }
            } else if ((pkgReg.test(lib))) { // require('@abc/something/cd') require('vue')
                source = path.join(this.modulesPath, lib);
                target = path.join(this.npmPath, lib);
                ext = '';
                needCopy = true;
            } else {
                throw new Error('无法解析的路径类型 '+lib);
            }

            // 处理无后缀情况
            // ext = path.extname(source);
            if (!isFile(source)) {
                // 解析拓展
                let pext = this.extensions.find((ext)=>isFile(source+ext));
                // 非完整后缀的路径
                if (isFile(source+this.ext)) ext = '.js'; // .wxa的文件转js
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
                        // source = path.join(source, main);
                        // target = path.join(target, main);
                        // console.log(lib, '\n', target);
                        ext = path.sep+main;
                    } else {
                        throw new Error('找不到文件 '+lib);
                    }
                }
            } else {
                ext = '';
            }
            // source = !path.extname(source) ? source+ext : source;
            // target = !path.extname(target) ? target + ext : target;
            // lib = !path.extname(lib) ? lib + ext : lib;
            source += ext;
            target += ext;
            lib += ext;
            resolved = lib;

            // 递归处理依赖
            if (needCopy) {
                this.compile('js', null, 'npm', path.parse(source));
            }

            // 路径修正
            if (type === 'npm') {
                if (lib[0] !== '.') {
                    // 依赖第三方包
                    // 手动添加../ 下面会删除，
                    resolved = path.join('..'+path.sep, path.relative(opath.dir, this.modulesPath), lib);
                } else {
                    // console.log(lib);
                    if (lib[0] === '.' && lib[1] === '.') resolved = './'+resolved;
                }
            } else {
                // console.log('resolved', ext, getDistPath(opath, ext, this.src, this.dist), target, resolved);
                resolved = path.relative(getDistPath(opath, 'js', this.src, this.dist), target);
            }
            // 转化windowd的\\，修复path,relative需要向上一级目录的缺陷
            resolved = resolved.replace(/\\/g, '/').replace(/^\.\.\//, './');
            return `require('${resolved}')`;
        });
    }

    npmHack(opath, code) {
        code = code.replace(/process\.env\.NODE_ENV/g, JSON.stringify(process.env.NODE_ENV));
        return code;
    }

    $compile(lang, code, type, opath) {
        if (!code) {
            code = readFile(path.join(opath.dir, opath.base));
            if (code === null) throw new Error('打开文件失败：'+path.join(opath.dir, opath.base));
        }

        let compilerLoader = new CompilerLoader();
        let Compiler = compilerLoader.get(lang);

        let compilation = new Compiler(this.current);
        return amazingCache({
            source: code,
            options: {configs: compilation.configs},
            transform: function(code, options) {
                return compilation.parse(code, options.configs);
            },
        }).then((succ)=>{
            let sourcemap;
            if (typeof succ === 'string') {
                code = succ;
            } else {
                code = succ.code;
                sourcemap = succ.map;
            }

            code = this.resolveDeps(code, type, opath);

            let target;

            if (type === 'npm') {
                code = this.npmHack(opath, code);
                target = path.join(this.npmPath, path.relative(this.modulesPath, path.join(opath.dir, opath.base)));
            } else {
                target = path.join(getDistPath(opath, 'js', this.src, this.dist));
            }

            if (sourcemap) {
                sourcemap.source = [opath.name+'.js'];
                sourcemap.file = opath.name+'.js';
                code += `\r\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,${Base64.encode(JSON.stringify(sourcemap))}`;
            }

            this.code = code;
            // writeFile(target, code);
            return this.hooks.optimizeAssets.promise(code, this).then((err)=>{
                if (err) return Promise.reject(err);
                info('write', path.relative(this.current, target));
                schedule.pop(opath);
                writeFile(target, this.code);
            });
        }).catch((e)=>error(e));
    }

    compile(lang, code, type, opath) {
        if (schedule.check(opath)) {
            schedule.push(opath);
            this.$compile(lang, code, type, opath);
        }
    }
}
