import {getConfig, getFiles, readFile, isFile, error, getRelative, info, copy, applyPlugins, message, amazingCache} from './utils';
import path from 'path';
import CWxa from './compile-wxa';
import CScript from './compile-script';
import CStyle from './compile-style';
import CConfig from './compile-config';
import CTemplate from './compile-template';
import bar from './helpers/progressBar';
import logger from './helpers/logger';
import {EventEmitter} from 'events';
import compilerLoader from './loader';
import ASTManager from './ast/index';
import XMLManager from './xml/index';
import COLOR from './const/color';
import debugPKG from 'debug';
import * as NODE from './const/node';
import defaultPret from './const/defaultPret';
import wrapWxa from './helpers/wrapWxa';

/**
 * todo:
 *  1. full control compile task
 */
let count = 0;
let debug = debugPKG('WXA:Schedule');

class Schedule extends EventEmitter {
    constructor(src, dist, ext) {
        super();
        this.current = process.cwd();
        this.pending = [];
        this.waiting = [];
        this.finished = [];
        this.npmOrLocal = [];

        this.src = src || 'src';
        this.dist = dist || 'dist';
        this.wxaExt = ext || '.wxa';

        this.meta = {
            current: this.current,
            src: this.src,
            dist: this.dist,
            wxaExt: this.wxaExt,
            libSrc: path.join(__dirname, '../lib-dist'),
            libs: ['wxa_wrap.js'],
        };

        this.max = 5;

        this.bar = bar;
        this.logger = logger;
        this.mode = 'compile';
        this.wxaConfigs = {}; // wxa.config.js

        let wxaConfigs;
        Object.defineProperty(this, 'wxaConfigs', {
            get() {
                return wxaConfigs;
            },
            set(configs) {
                if (!configs.resolve || !configs.resolve.extensions) {
                    configs.resolve = {
                        extensions: ['.js', '.json'],
                        ...configs.resolve,
                    };
                }
                wxaConfigs = configs;
            },
        });

        this.$pageArray = []; // denpendencies
        this.$indexOfModule = []; // all module
        this.$isMountingCompiler = false; // if is mounting compiler, all task will be blocked.
    }

    set(name, value) {
        this[name] = value;
    }

    parse(opath, rst, configs) {
        if (typeof opath === 'string') opath = path.parse(opath);

        count++;
        if (rst) {
            let all = [];
            if (rst.style) {
                let compiler = new CStyle(this.src, this.dist, this.ext, this.options);
                applyPlugins(compiler);
                all.push(compiler.compile(rst.style, opath));
            }

            if (rst.template && rst.template.code) {
                let cTemplate = new CTemplate(this.src, this.dist, this.ext, this.options);
                applyPlugins(cTemplate);
                all.push(cTemplate.compile(rst.template));
            }

            if (rst.script.code) {
                let compiler = new CScript(this.src, this.dist, this.ext, this.options);
                applyPlugins(compiler);
                all.push(compiler.compile(rst.script.type, rst.script.code, configs.type, opath));
            }

            if (rst.config.code) {
                let compiler = new CConfig(this.src, this.dist, this.options);
                applyPlugins(compiler);
                all.push(compiler.compile(rst.config.code, opath));
            }

            return Promise.all(all);
        } else {
            if (!isFile(opath)) {
                error('不存在文件:' + getRelative(opath));
                return Promise.reject();
            }

            switch (opath.ext) {
                case this.ext: {
                    let cWxa = new CWxa(this.src, this.dist, this.ext, this.options);
                    return cWxa.compile(opath, configs);
                }
                case '.sass':
                case '.scss': {
                    let cStyle = new CStyle(this.src, this.dist, opath.ext, this.options);
                    applyPlugins(cStyle);
                    return cStyle.compile('sass', opath);
                }
                case '.wxs':
                case '.js': {
                    let cScript = new CScript(this.src, this.dist, opath.ext, this.options);
                    applyPlugins(cScript);
                    let filepath = path.join(opath.dir, opath.base);
                    let type = configs.type;
                    if (filepath === path.join(this.current, this.src, 'app.js')) type = 'app';
                    return cScript.compile('js', null, type, opath);
                }
                case '.json': {
                    let cConfig = new CConfig(this.src, this.dist, this.options);
                    applyPlugins(cConfig);
                    return cConfig.compile(void(0), opath);
                }
                case '.wxml': {
                    let cTemplate = new CTemplate(this.src, this.dist, this.options);
                    applyPlugins(cTemplate);
                    return cTemplate.compile('wxml', opath);
                }
                default:
                    info('copy', path.relative(this.current, path.join(opath.dir, opath.base)) );

                    return copy(opath, opath.ext, this.src, this.dist);
            }
        }
    }

    addTask(opath, rst, configs={}) {
        if (this.wxaConfigs.resolve && this.wxaConfigs.resolve.ignore) {
            let pathString = opath.dir + path.sep + opath.base;
            let ignore = this.wxaConfigs.resolve.ignore;
            ignore = Array.isArray(ignore) ? ignore : [ignore];

            let invalid = ignore.some((exp)=>{
                let r = (exp instanceof RegExp) ? exp : new RegExp(exp);

                return r.test(pathString.replace(/\\/g, '/'));
            });

            if (invalid) return;
        }

        let newTask = {
            opath,
            rst,
            // duplicate: 0,
            configs,
        };
        // record npm or local file
        if (['local', 'npm'].indexOf(configs.type) > -1 ) {
            this.npmOrLocal.push(opath);
        }

        if (['change', 'add'].indexOf(configs.category) > -1) {
            this.waiting.push(newTask);
        } else {
            let ifWaiting = this.filterTask(this.waiting, newTask);
            let ifPending = this.filterTask(this.pending, newTask);
            let ifFinished = this.filterTask(this.finished, newTask);
            if (ifWaiting === -1 && ifPending === -1 && ifFinished === -1) {
                this.waiting.push(newTask);
                this.updateBar();
            } else if (ifWaiting > -1) {
                // this.waiting[ifWaiting].duplicate++;
            } else if (ifPending > -1) {
                // this.pending[ifPending].duplicate++;
            }
        }

        this.process();
    }

    toggleMounting($isMountingCompiler=false) {
        this.$isMountingCompiler = $isMountingCompiler;

        if (!this.$isMountingCompiler) {
            this.process();
        }
    }

    filterTask(queue, task) {
        return queue.findIndex((t)=>JSON.stringify(t)===JSON.stringify(task));
    }

    process() {
        while (!this.$isMountingCompiler && this.pending.length < this.max && this.waiting.length) {
            let task = this.waiting.shift();
            this.pending.push(task);
            this.parse(task.opath, task.rst, task.configs).then((succ)=>{
                let idx = this.pending.findIndex((t)=>JSON.stringify(t)===JSON.stringify(task));
                // delete task;
                if (idx > -1) this.finished = this.finished.concat(this.pending.splice(idx, 1));
                this.bar.update(this.finished.length);
                this.checkStatus();
                this.process();
            }).catch((e)=>{
                let idx = this.pending.findIndex((t)=>JSON.stringify(t)===JSON.stringify(task));
                // delete task;
                if (idx > -1) this.finished = this.finished.concat(this.pending.splice(idx, 1));
                this.bar.update(this.finished.length);
                this.checkStatus();
                this.process();
            });
        }
    }

    updateBar() {
        this.bar.init(this.finished.length+this.pending.length+this.waiting.length);
    }

    checkStatus() {
        if (this.pending.length <=0 && this.waiting.length <= 0) {
            // end compile
            this.bar.clean();
            logger.show(this.options.verbose);
            this.emit('finish', this.finished.length);
            this.finished = [];
        }
    }

    doDPA() {
        if (
            this.appConfigs == null ||
            !this.appConfigs.pages ||
            !this.appConfigs.pages.length
        ) {
            logger.errorNow('app页面配置缺失, 请检查app.json的pages配置项');
        }

        let pages = this.appConfigs.pages;
        // multi packages process.
        if (this.appConfigs.subPackages) {
            let subPages = this.appConfigs.subPackages.reduce((subPkgs, pkg)=>{
                return subPkgs.concat(pkg.pages.map((subpath)=>pkg.root+'/'+subpath));
            }, []);

            pages = pages.concat(subPages);
        }

        // pages spread
        let exts = Object.keys(compilerLoader.map);
        pages.forEach((page)=>{
            // wxa file
            let wxaPage = path.join(this.current, this.src, page+this.meta.wxaExt);
            if (isFile(wxaPage)) {
                try {
                    this.$pageArray.push({
                        src: wxaPage,
                        type: 'wxa',
                        category: 'Page',
                        pagePath: page,
                    });
                } catch (e) {
                    console.error(e);
                }
            } else {
                exts.forEach((ext)=>{
                    let p = path.join(this.current, this.src, page+ext);
                    if (isFile(p)) {
                        this.$pageArray.push({
                            src: p,
                            type: ext,
                            category: 'Page',
                            pagePath: page,
                        });
                    }
                });
            }
        });
        console.log(this.$pageArray);

        if (!this.$pageArray.length) {
            logger.errorNow('找不到可编译的页面');
            return;
        }

        // lib compile
        let libs = this.meta.libs.map((file)=>{
            let libDep = {
                src: path.join(this.meta.current, this.meta.src, '_wxa', file),
                $from: path.join(this.meta.libSrc, file),
                category: 'Lib',
            };

            libDep.code = readFile(libDep.$from);

            return libDep;
        });

        this.$depPending = [].concat(libs, this.$pageArray);
        this.$indexOfModule = [].concat(libs, this.$pageArray);
        debug('depPending %o', this.$depPending);
        debug('DPA started');
        return this.$doDPA();
    }

    $doDPA() {
        let tasks = [];
        while (this.$depPending.length) {
            let dep = this.$depPending.shift();

            debug('file to parse %O', dep);
            tasks.push(this.$parse(dep));
        }

        return Promise.all(tasks).then((succ)=>{
            if (this.$depPending.length === 0) {
                // dependencies resolve complete
                this.emit('finish', this.$indexedModule);
            } else {
                return this.$doDPA();
            }
        });
    }

    async $parse(dep) {
        let compiler = compilerLoader.get(dep.type || path.extname(dep.src));
        debug('compiler %o', compiler);

        // try to wrap wxa every app and page
        this.tryWrapWXA(dep);

        try {
            let code = dep.code || readFile(dep.src) || false;

            let cacheParams = {
                source: code,
                options: {
                    configs: {
                        ast: true,
                        ...(compiler.configs || {}),
                    },
                },
                transform: (code, options)=>{
                    return compiler.parse(code, options.configs, dep.src, dep.type || path.extname(dep.src));
                },
            };

            let ret = await amazingCache(cacheParams, this.options.cache && code);

            debug('transform succ %O', ret);

            // todo: app.js or app.wxa will do compile twice.
            // drop template from app.wxa
            if (ret.rst && dep.category === 'app') delete ret.rst.template;

            if (typeof ret === 'string') {
                dep.code = ret;
            }

            if (ret.rst) {
                dep.rst = ret.rst;

                this.$$parseRST(dep);
            }

            if (ret.xml) {
                dep.xml = ret.xml;

                this.$$parseXML(dep);
            }

            if (ret.ast) {
                // only allow babel-ast
                dep.ast = ret.ast;

                this.$$parseAST(dep);
            }

            if (ret.config) dep.config = ret.config;

            dep.color = COLOR.COMPILED;
            // tick event
            this.emit('tick', dep);
            // continue
            this.$doDPA();
        } catch (e) {
            // logger.errorNow('编译失败', e);
            debug('编译失败 %O', e);
        }
    }

    $$parseRST(mdl) {
        // spread mdl with child nodes
        mdl.childNotes = mdl.childNotes || [];
        Object.keys(mdl.rst).forEach((key)=>{
            let dep = mdl.rst[key];
            // wxa file pret object should as same as his parent node.
            dep.pret = mdl.pret || defaultPret;
            dep.category = mdl.category || '';
            dep.pagePath = mdl.pagePath || void(0);
            let child = this.findOrAddDependency(dep, mdl);
            mdl.childNotes.push(child);
        });
    }

    $$parseAST(mdl) {
        let deps = new ASTManager(this.wxaConfigs.resolve||{}, this.meta).parse(mdl);

        // analysis deps;
        mdl.childNotes = mdl.childNotes || [];
        deps.forEach((dep)=>{
            let child = this.findOrAddDependency(dep, mdl);
            mdl.childNotes.push(child);
        });
    }

    $$parseXML(mdl) {
        let deps = new XMLManager(this.wxaConfigs.resolve||{}, this.meta).parse(mdl);

        // analysis deps;
        mdl.childNotes = mdl.childNotes || [];
        deps.forEach((dep)=>{
            let child = this.findOrAddDependency(dep, mdl);
            mdl.childNotes.push(child);
        });
    }

    findOrAddDependency(dep, mdl) {
        // circle referrence.
        dep.reference = dep.reference || {};
        dep.reference.parent = mdl;

        // pret backup
        dep.pret = dep.pret || {
            isNodeModule: false,
            isPlugin: false,
            isURI: false,
            isRelative: true,
        };

        let indexedModule = this.$indexOfModule.find((module)=>module.src===dep.src);
        let child = {
            ...dep,
            color: COLOR.INIT,
            isNpm: dep.pret.isNodeModule,
            isPlugin: dep.pret.isPlugin,
            $target: dep.target,
            $pret: dep.pret,
        };

        if (indexedModule) {
            let ref = dep.reference;

            // merge from.
            if (Array.isArray(indexedModule.reference)) {
                indexedModule.reference.push(ref);
            } else if (typeof indexedModule.reference === 'object') {
                indexedModule.reference = [
                    indexedModule.reference,
                    ref,
                ];
            } else {
                indexedModule.reference = ref;
            }

            child = indexedModule;
        } else if (!child.isPlugin) {
            // plugin do not resolve dependencies.
            this.$depPending.push(child);
            this.$indexOfModule.push(child);
        }

        return child;
    }

    tryWrapWXA(dep) {
        if (dep.type === 'wxa') return;

        if (~['app', 'component', 'page'].indexOf(dep.category) && dep.type === 'js') {
            if (dep.code == null) dep.code= readFile(dep.src);

            if (dep.code == null) dep.code = '';

            dep.code = wrapWxa(dep.code, dep.category, dep.pagePath);
            debug('wrap dependencies %O', dep);
        }
    }
}
const schedule = new Schedule();

export default schedule;
