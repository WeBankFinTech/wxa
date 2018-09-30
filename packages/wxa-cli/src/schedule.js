import {readFile, isFile, amazingCache} from './utils';
import path from 'path';
import bar from './helpers/progressBar';
import logger from './helpers/logger';
import {EventEmitter} from 'events';
import loader from './loader';
import COLOR from './const/color';
import ROOT from './const/root';
import debugPKG from 'debug';
import defaultPret from './const/defaultPret';
import wrapWxa from './helpers/wrapWxa';
import Compiler from './compilers/index';
import crypto from 'crypto';
import {unlinkSync} from 'fs';
import DependencyResolver from './helpers/dependencyResolver';

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

        this.APP_CONFIG_PATH = path.join(this.current, this.src, 'app.json');

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
                configs.target = configs.target || 'wxa';
                wxaConfigs = configs;
            },
        });

        this.$pageArray = []; // denpendencies
        this.$depPending = []; // pending dependencies
        this.$indexOfModule = []; // all module
        this.$isMountingCompiler = false; // if is mounting compiler, all task will be blocked.

        // save all app configurations for compile time.
        // such as global components.
        this.app = {};

        // load from path/to/project/src/app.json
        this.appConfigs = {};

        // cmd options
        this.cmdOptions = {};
    }

    set(name, value) {
        this[name] = value;
    }

    addEntryPoint(mdl) {
        return this.findOrAddDependency(mdl, ROOT);
    }

    async doDPA() {
        if (!this.$depPending.length) {
            logger.errorNow('找不到可编译的入口文件');
            return;
        }

        debug('depPending %o', this.$depPending);
        debug('DPA started');

        return this.$doDPA();
    }

    $doDPA() {
        let tasks = [];
        // while (this.$depPending.length) {
            let dep = this.$depPending.shift();

            debug('file to parse %O', dep);
            tasks.push(this.$parse(dep));
        // }

        return Promise.all(tasks).then(async (succ)=>{
            if (this.$depPending.length === 0) {
                // dependencies resolve complete
                return Promise.resolve(succ);
            } else {
                let sub = await this.$doDPA();
                return succ.concat(sub);
            }
        });
    }

    async $parse(dep) {
        // loader: use custom compiler to load resource.
        await loader.compile(dep);

        // try to wrap wxa every app and page
        this.tryWrapWXA(dep);

        try {
            // Todo: conside if cache is necessary here.
            // let cacheParams = {
            //     source: code,
            //     options: {
            //         configs: {
            //             ast: true,
            //         },
            //     },
            //     transform: (code, options)=>{
            //         return compiler.parse(code, options.configs, dep.src, dep.type || path.extname(dep.src));
            //     },
            // };
            debug('dep to process %O', dep);
            let compiler = new Compiler(this.wxaConfigs.resolve, this.meta);
            let childNodes = await compiler.parse(dep);

            debug('childNodes', childNodes);
            let children = childNodes.map((node)=>this.findOrAddDependency(node, dep));

            // if watch mode, use childNodes to clean up the dep tree.
            // update each module's childnodes, then according to reference unlink file.
            this.cleanUpChildren(children, dep);

            // cover new childNodes
            dep.childNodes = new Set(children);
            dep.color = COLOR.COMPILED;

            // if module is app.json, then add Page entry points.
            if (dep.src === this.APP_CONFIG_PATH) {
                this.appConfigs = dep.json;
                debug('app configs is Changed, %O', dep.json);

                this.addPageEntryPoint();
            }

            // tick event
            this.emit('tick', dep);
            return dep;
        } catch (e) {
            // logger.errorNow('编译失败', e);
            debug('编译失败 %O', e);
        }
    }

    cleanUpChildren(newChildren, mdl) {
        debug('clean up module %O', mdl);
        if (mdl.childNodes == null) return;

        mdl.childNodes.forEach((oldChild)=>{
            if (!~newChildren.findIndex((item)=>item.src === oldChild.src)) {
                // child node not used, update reference.
                debug('denpendencies clean up started');

                if (oldChild.reference == null) {
                    debug('Error: old child node\'s reference is no find %O', oldChild );
                    return;
                }

                let idxOfParent = oldChild.reference.findIndex((ref)=>ref.parent.src === mdl.src);

                if (idxOfParent === -1) {
                    debug('Error: do not find parent module');
                    return;
                }

                oldChild.reference.splice(idxOfParent, 1);

                if (oldChild.reference.length === 0) {
                    debug('useless module find %s', oldChild.src);

                    // nested clean children
                    this.cleanUpChildren([], oldChild);
                    // unlink module
                    oldChild.meta && unlinkSync(oldChild.meta.accOutputPath);
                    this.$indexOfModule.splice(this.$indexOfModule.findIndex((mdl)=>mdl.src===oldChild.src), 1);
                }
            }
        });
    }

    findOrAddDependency(dep, mdl) {
        debug('Find Dependencies started');
        // calc hash
        if (dep.code) dep.hash = crypto.createHash('md5').update(dep.code).digest('hex');
        debug('Dep HASH: %s', dep.hash);

        // circle referrence.
        dep.reference = dep.reference || {};
        dep.reference.parent = mdl;

        // pret backup
        dep.pret = dep.pret || defaultPret;

        let indexedModuleIdx = this.$indexOfModule.findIndex((file)=>file.src===dep.src);
        debug('Find index of moduleList %s', indexedModuleIdx);
        let child = {
            ...dep,
            color: COLOR.INIT,
            isNpm: dep.pret.isNodeModule,
            isPlugin: dep.pret.isPlugin,
            $target: dep.target,
            $pret: dep.pret,
            reference: [dep.reference],
        };

        if (indexedModuleIdx > -1) {
            let indexedModule = this.$indexOfModule[indexedModuleIdx];
            let ref = dep.reference;
            debug('Find out module HASH is %s %O', indexedModule.hash, indexedModule);

            // merge from.
            if (Array.isArray(indexedModule.reference)) {
                indexedModule.reference.push(ref);
            } else if (typeof indexedModule.reference === 'object') {
                // dead code theorily
                debug('dead code execute');

                indexedModule.reference = [
                    indexedModule.reference,
                    ref,
                ];
            } else {
                indexedModule.reference = ref;
            }


            if (this.mode === 'watch' && indexedModule.hash !== child.hash) {
                debug('WATCH MODE and HASH is Changed');
                let newChild = {...indexedModule, ...child};
                this.$depPending.push(newChild);

                this.$indexOfModule.splice(indexedModuleIdx, 1, newChild);
                child = newChild;
            } else {
                child = indexedModule;
            }
        } else if (!child.isPlugin) {
            // plugin do not resolve dependencies.
            this.$depPending.push(child);
            this.$indexOfModule.push(child);
        }

        return child;
    }

    tryWrapWXA(dep) {
        if (dep.type === 'wxa') return;

        if (
            ~['app', 'component', 'page'].indexOf(dep.category ? dep.category.toLowerCase() : '') &&
            dep.type === 'js'
        ) {
            // if (dep.code == null) dep.code= readFile(dep.src);

            // if (dep.code == null) dep.code = '';

            dep.code = wrapWxa(dep.code, dep.category, dep.pagePath);
            debug('wrap dependencies %O', dep);
        }
    }

    addPageEntryPoint() {
        // ToDo: drop entry point and clean up children after page entry point update.
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

        let tryPush = (page)=>{
            let idx = this.$pageArray.filter((p)=>p.src===page.src);
            if (idx > -1) {
                this.$pageArray.splice(idx, 1, page);
            } else {
                this.$pageArray.push(page);
            }
        };

        // pages spread
        let exts = ['.wxml', '.wxss', '.js', '.json'];
        pages.forEach((page)=>{
            // console.log(page);
            // wxa file
            let wxaPage = path.join(this.current, this.src, page+this.meta.wxaExt);

            let dr = new DependencyResolver(schedule.wxaConfigs.resolve, schedule.meta);

            if (isFile(wxaPage)) {
                try {
                    let pagePoint = this.addEntryPoint({
                        code: readFile(wxaPage),
                        src: wxaPage,
                        category: 'Page',
                        pagePath: page,
                        pret: defaultPret,
                        isAbstract: true,
                        meta: {
                            source: wxaPage,
                        },
                    });

                    tryPush(pagePoint);
                } catch (e) {
                    console.error(e);
                }
            } else {
                exts.forEach((ext)=>{
                    let p = path.join(this.current, this.src, page+ext);
                    if (isFile(p)) {
                        let outputPath = dr.getOutputPath(p, defaultPret, ROOT);
                        let pagePoint = this.addEntryPoint({
                            code: readFile(p),
                            src: p,
                            category: 'Page',
                            pagePath: page,
                            pret: defaultPret,
                            meta: {
                                source: p,
                                outputPath,
                            },
                        });

                        tryPush(pagePoint);
                    }
                });
            }
        });
        // console.log(this.$pageArray);

        if (!this.$pageArray.length) {
            logger.errorNow('找不到可编译的页面');
            return;
        }
    }
}
const schedule = new Schedule();

export default schedule;
