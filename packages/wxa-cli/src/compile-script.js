import path from 'path';
import fs from 'fs';
import {readFile, getDistPath, error, writeFile, isFile, isDir, getConfig, amazingCache, info, applyPlugins} from './utils';
import {Base64} from 'js-base64';
import {Tapable, AsyncSeriesHook} from 'tapable';
import findRoot from 'find-root';
import schedule from './schedule';
import compilerLoader from './loader';
import PathParser from './helpers/pathParser';
import logger from './helpers/logger';

export default class CScript {
    constructor(src, dist, ext, options) {
        // super();
        this.hooks = {
            optimizeAssets: new AsyncSeriesHook(['opath', 'compilation']),
        };
        this.schedule = [];
        this.type = 'js';
        this.current = process.cwd();
        this.src = src;
        this.dist = dist;
        this.ext = ext;

        this.$sourceType = (ext||'').replace(/^\./, '') === 'wxs' ? 'wxs' : 'script';
        this.options = options || {};
        this.code = '';
        let configs = getConfig();
        this.alias = configs.resolve && configs.resolve.alias || {};
        this.extensions = configs.resolve && configs.resolve.extensions || ['.js', '.json'];
        this.modulesPath = path.join(this.current, 'node_modules', path.sep);
        this.localVisualPath = path.join(this.current, 'local', path.sep);
        this.npmPath = path.join(this.current, dist, 'npm', path.sep);
        this.localPath = path.join(this.current, dist, 'local', path.sep);
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
        return code.replace(
            // /([\.][\t\n\s]*)?require\([']([\w\d_\-\.\/@]+)['"]\)/ig,
            /(?:\/\*[\s\S]*?\*\/|(?:[^\\:]|^)\/\/.*)|(\.)?require\(['"]([\w\d_\-\.\/@]+)['"]\)/igm,

            (match, point, lib)=>{
            // a.require()
            if (point) return match;
            // ignore comment
            if (point == null && lib == null) return match;

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
                        // calc relative path base cwd;
                        tar = path.join(path.relative(tar, opath.dir), otar.base);
                        lib = tar
                                .replace(/(^\.\.\/)|(^\.\.\\\\)/, './')
                                .replace(/\\/g, '/');
                    }
                });
            }

            let pret = new PathParser().parse(lib);
            // console.log(opath, pret);
            if (pret.isRelative) {
                source = path.join(opath.dir, lib);
                if (type === 'npm') {
                    target = path.join(this.npmPath, path.relative(this.modulesPath, source));
                    needCopy = true;
                } else if (type === 'local') {
                    target = path.join(this.localPath, path.relative(this.localVisualPath, source));
                    needCopy = true;
                } else {
                    let otarget = path.parse(getDistPath(source, void(0), this.src, this.dist));
                    target = otarget.dir+path.sep+otarget.base;
                }
            } else if (pret.isNodeModule) {
                source = path.join(this.modulesPath, lib);
                target = path.join(this.npmPath, lib);
                ext = '';
                needCopy = true;
            } else if (pret.isAbsolute) {
                // 绝对路径, 不支持嵌套，不支持重名
                source = lib;
                let opath = path.parse(lib);
                target = path.join(this.localPath, opath.base);
                needCopy = true;
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

            // 递归处理依赖
            if (needCopy) {
                schedule.addTask(path.parse(source), void(0), {type: pret.isAbsolute ? 'local' : 'npm'});
            }

            // 路径修正
            if (type === 'npm') {
                if (lib[0] !== '.') {
                    // 依赖第三方包
                    // 手动添加../ 下面会删除，
                    resolved = path.join(path.relative(opath.dir, this.modulesPath), lib);
                } else {
                    // console.log(lib);
                    if (lib[0] === '.' && lib[1] === '.') resolved = './'+resolved;
                }
            } else if (type === 'local') {
                resolved = path.join(path.relative(opath.dir, this.localVisualPath), path.parse(lib).base);
            } else {
                resolved = path.relative(getDistPath(opath, 'js', this.src, this.dist), target).replace(/(^\.\.\/)|(^\.\.\\)/, './');
            }
            // 转化windowd的\\，修复path, relative需要向上一级目录的缺陷
            resolved = resolved.replace(/\\/g, '/');
            return `require('${resolved}')`;
        });
    }

    npmHack(opath, code) {
        // inspired by wepy
        code = code.replace(/process\.env\.NODE_ENV/g, JSON.stringify(process.env.NODE_ENV));
        switch (opath.base) {
            case 'lodash.js':
            case '_root.js':
            case '_global.js':
                code = code.replace('Function(\'return this\')()', 'this');
                break;
            case '_html.js':
                code = 'module.exports = false;';
                break;
            case '_microtask.js':
                code = code.replace('if(Observer)', 'if(false && Observer)');
                // IOS 1.10.2 Promise BUG
                code = code.replace('Promise && Promise.resolve', 'false && Promise && Promise.resolve');
                break;
            // 并没有好的方法找到全局变量，top, self, this, window, global都不能解决三端问题, 只好采用https://cnodejs.org/topic/5846b2883ebad99b336b1e06的方式解决问题了。
            case '_freeGlobal.js':
                code = code.replace('module.exports = freeGlobal;', `module.exports = {
                    Array: Array,
                    Date: Date,
                    Error: Error,
                    Function: Function,
                    Math: Math,
                    Object: Object,
                    RegExp: RegExp,
                    String: String,
                    TypeError: TypeError,
                    setTimeout: setTimeout,
                    clearTimeout: clearTimeout,
                    setInterval: setInterval,
                    clearInterval: clearInterval
                  };
                `);
        }
        return code;
    }

    checkIgnore(opath, ignore) {
        let filepath = opath.dir + path.sep + opath.base;

        if (Array.isArray(ignore)) {
            return ignore.some((str)=>{
                let reg = typeof str === 'object' ? str : new RegExp(str);

                return reg.test(filepath);
            });
        } else {
            let reg = typeof ignore === 'object' ? ignore : new RegExp(ignore);

            return reg.test(filepath);
        }
    }

    $compile(lang, code, type, opath) {
        if (!code) {
            code = readFile(path.join(opath.dir, opath.base));
            if (code === null) throw new Error('打开文件失败：'+path.join(opath.dir, opath.base));
        }

        let compiler = compilerLoader.get(lang);

        return amazingCache({
            source: code,
            options: {configs: compiler.configs},
            transform: (code, options)=>{
                return compiler.parse(code, options.configs, opath);
            },
        }, this.options.cache).then((succ)=>{
            let sourcemap;
            if (typeof succ === 'string') {
                code = succ;
            } else {
                code = succ.code;
                sourcemap = succ.map;
            }
            code = this.resolveDeps(code, type, opath);
            let target;
            let ext = '.js';

            if (type === 'npm') {
                code = this.npmHack(opath, code);
                target = path.join(this.npmPath, path.relative(this.modulesPath, path.join(opath.dir, opath.name+'.js')));
            } else if (type === 'local') {
                target = path.join(this.localPath, opath.name+'.js');
                // console.log('local', target);
            } else if (opath.ext === '.wxs') {
                target = path.join(getDistPath(opath, 'wxs', this.src, this.dist));
                ext = '.wxs';
            } else {
                target = path.join(getDistPath(opath, 'js', this.src, this.dist));
            }
            if (sourcemap) {
                sourcemap.source = [opath.name+ext];
                sourcemap.file = opath.name+ext;
                code += `\r\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,${Base64.encode(JSON.stringify(sourcemap))}`;
            }

            this.code = code;
            this.$sourceFrom = type;
            return this.hooks.optimizeAssets.promise(opath, this).then((err)=>{
                if (err) return Promise.reject(err);
                logger.info('write', path.relative(this.current, target));
                writeFile(target, this.code);
            });
        }).catch((e)=>{
            logger.errorNow('Error In: '+path.join(opath.dir, opath.base), e);
        });
    }

    compile(lang, code, type, opath) {
        return this.$compile(lang, code, type, opath);
    }
}
