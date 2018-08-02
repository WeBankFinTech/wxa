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
import COLOR from './const/color';

/**
 * todo:
 *  1. full control compile task
 */
let count = 0;

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
        this.ext = ext || '.wxa';

        this.meta = {
            src,
            dist,
            ext,
        };

        this.max = 5;

        this.bar = bar;
        this.logger = logger;
        this.mode = 'compile';
        this.wxaConfigs = {}; // wxa.config.js
        this.$pageArray = []; // denpendencies
        this.$index = []; // all module
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
            !!this.appConfigs.pages ||
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
        console.log(pages);
        pages.forEach((page)=>{
            // wxa file
            let wxaPage = path.join(this.src, page+this.ext);
            if (isFile(wxaPage)) {
                this.$pageArray.push({
                    src: wxaPage,
                    type: 'wxa',
                    category: 'Page',
                });
            } else {
                exts.forEach((ext)=>{
                    let p = path.join(this.src, page+ext);
                    if (isFile(p)) {
                        this.$pageArray.push({
                            src: p,
                            type: ext,
                            category: 'Page',
                        });
                    }
                });
            }
        });

        if (this.$pageArray.length) {
            logger.errorNow('找不到可编译的页面');
            return;
        }

        this.$depPending = this.$pageArray.slice(0);
        this.$index = this.$pageArray.slice(0);

        return this.$doDPA();
    }

    $doDPA() {
        while (this.$depPending.length) {
            let dep = this.$depPending.shift();

            this.$parse(dep);
        }
    }

    async $parse(dep) {
        let compiler = compilerLoader.get(dep.type);

        try {
            let ret = await amazingCache({
                source: dep.code,
                options: {
                    configs: {
                        ast: true,
                        ...compiler.configs,
                    },
                },
                transfrom(code, options) {
                    return compiler.parse(code, options.configs, dep.src, dep.type);
                },
            }, this.options.cache);

            if (typeof ret === 'string') {
                dep.code = ret;
            }

            if (ret.rst) {
                dep.rst = ret.rst;

                this.$$parseRST(dep);
            }

            if (ret.xml) dep.xml = ret.xml;

            if (ret.ast) {
                // only allow babel-ast
                dep.ast = ret.ast;

                this.$$parseAST(dep);
            }

            if (ret.config) dep.config = ret.config;
        } catch (e) {
            logger.errorNow('编译失败', e);
        }
    }

    $$parseRST(dep) {
        // spread dep with child nodes
        dep.childNotes = dep.childNotes || [];
        Object.keys(dep.rst).forEach((key)=>{
            let m = this.$index.find((module)=>module.src===dep.rst[key].src);
            let child;

            if (m) {
                child = m;
            } else {
                child = {
                    ...dep.rst[key],
                    color: COLOR.INIT,
                };
                this.$depPending.push(child);
                this.$index.push(child);
            }

            dep.childNotes.push(child);
        });
    }

    $$parseAST(mdl) {
        let deps = new ASTManager(this.wxaConfigs.resolve||{}, this.meta).parse(mdl.ast);

        // analysis deps;
        mdl.childNotes = mdl.childNotes || [];
        deps.forEach((dep)=>{
            let m = this.$index.find((module)=>module.src===dep.src);
            let child;

            if (m) {
                child = m;
            } else {
                child = {
                    src: dep.absPath,
                    color: COLOR.INIT,
                    isNpm: dep.pret.isNodeModule,
                    isPlugin: dep.pret.isURI,
                    $target: dep.target,
                    $pret: dep.pret,
                };
                this.$depPending.push(child);
                this.$index.push(child);
            }

            mdl.childNotes.push(child);
        });
    }
}
const schedule = new Schedule();

export default schedule;
