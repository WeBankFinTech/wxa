import path from 'path';
import {readFile, getDistPath, error, writeFile, isFile, isDir, getConfig, amazingCache} from './utils';
import {transform} from 'babel-core';
import {Base64} from 'js-base64';
import {Tapable, AsyncSeriesHook} from 'tapable';
const pkg = require('../package.json');

function compileWithBabel(content, config) {
    console.info('compile with babel');
    try {
        let rst = transform(content, config);
        return Promise.resolve(rst);
    } catch (e) {
        return Promise.reject(e);
    }
}

export default class CScript {
    constructor(src, dist, ext) {
        // super();
        this.hooks = {
            optimizeAssets: new AsyncSeriesHook(['code', 'compilation']),
        };
        this.current = process.cwd();
        this.src = src;
        this.dist = dist;
        this.ext = ext;
        this.code = '';
        this.modulesPath = path.join(this.current, 'node_modules', path.sep);
        this.npmPath = path.join(this.current, dist, 'npm', path.sep);
    }

    getPkgConfig(lib) {
        let content = readFile(path.join(this.modulesPath, lib, 'package.json'));
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

            if (lib[0] === '.') { // require('./a/b/c)' require('..')
                source = path.join(opath.dir, lib);
                if (type === 'npm') {
                    target = path.join(this.npmPath, path.relative(this.modulesPath, source));
                    needCopy = true;
                } else {
                    target = getDistPath(source, '.js', this.src, this.dist);
                }
            } else if (lib.indexOf('/') === -1 || // require('asset');
                lib.indexOf('/') === lib.length - 1 || // require('a/b/something/') require('vue/dist/runtime.common')
                (lib[0] === '@' && lib.indexOf('/') !== -1 && lib.lastIndexOf('/') === lib.indexOf('/')) // require('@abc/something')
            ) {
                let pkg = this.getPkgConfig(lib);
                if (!pkg) {
                    throw new Error('找不到模块'+lib);
                }
                let main = pkg.main || 'index.js';
                if (pkg.browser && typeof pkg.browser === 'string') {
                    main = pkg.browser;
                }
                source = path.join(this.modulesPath, lib, main);
                target = path.join(this.npmPath, lib, main);
                lib += path.sep + main;
                ext = '';
                needCopy = true;
            } else {
                source = path.join(this.modulesPath, lib);
                target = path.join(this.npmPath, lib);
                ext = '';
                needCopy = true;
            }
            // console.log('target', target);

            if (isFile(path.join(source+this.ext))) {
                ext = '.js';
            } else if (isFile(path.join(source+'.js'))) {
                ext = '.js';
            } else if (isDir(source) && isFile(source+path.sep+'index.js')) {
                ext = path.sep+'index.js';
            } else if (isFile(source)) {
                ext = '';
            } else {
                throw new Error('找不到文件'+lib);
            }

            source += ext;
            target += ext;
            lib += ext;
            resolved = lib;

            if (needCopy) {
                this.compile('js', null, 'npm', path.parse(source));
            }

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
                resolved = path.relative(getDistPath(opath, opath.ext, this.src, this.dist), target);
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

    compile(lang, code, type, opath) {
        if (!code) {
            code = readFile(path.join(opath.dir, opath.base));
            if (code === null) throw new Error('打开文件失败：'+path.join(opath.dir, opath.base));
        }

        let configs = getConfig().compilers.babel;
        amazingCache({
            source: code,
            options: {configs},
            transform: function(code, options) {
                return compileWithBabel(code, options.configs);
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
                target = path.join(this.npmPath, path.relative(this.modulesPath, path.join(opath.dir, opath.base)));
            } else {
                code = this.npmHack(opath, code);
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
                writeFile(target, this.code);
            });
        }).catch((e)=>error(e));
    }
}
