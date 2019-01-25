import {readFile, isFile} from './utils';
import path from 'path';
import fs from 'fs';
import {performance, PerformanceObserver} from 'perf_hooks';
import globby from 'globby';
import bar from './helpers/progressBar';
import logger from './helpers/logger';
import {EventEmitter} from 'events';
// import loader from './loader';
import COLOR from './const/color';
import ROOT from './const/root';
import debugPKG from 'debug';
import defaultPret from './const/defaultPret';
import wrapWxa from './helpers/wrapWxa';
import Compiler from './compilers/index';
import crypto from 'crypto';
import {unlinkSync} from 'fs';
import DependencyResolver from './helpers/dependencyResolver';
import ProgressTextBar from './helpers/progressTextBar';
import simplify from './helpers/simplifyObj';

let debug = debugPKG('WXA:Schedule');

class Schedule {
    constructor(loader) {
        this.current = process.cwd();
        this.loader = loader;
        this.pending = [];
        this.waiting = [];
        this.finished = [];
        this.npmOrLocal = [];

        this.meta = {
            current: this.current,
            wxaExt: 'wxa',
            libSrc: path.join(__dirname, '../lib-dist'),
            libs: ['wxa_wrap.js'],
            context: path.join(this.current, 'src'),
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
                wxaConfigs = configs;

                this.APP_CONFIG_PATH = wxaConfigs.resolve.appConfigPath;
                this.APP_SCRIPT_PATH = wxaConfigs.resolve.appScriptPath;

                this.meta = {
                    ...this.meta,
                    wxaExt: wxaConfigs.resolve.wxaExt,
                    context: wxaConfigs.context,
                    output: wxaConfigs.output,
                };
            },
        });

        this.$pageArray = []; // denpendencies
        this.$depPending = []; // pending dependencies
        this.$indexOfModule = [ROOT]; // all module
        this.$isMountingCompiler = false; // if is mounting compiler, all task will be blocked.
        this.progress = new ProgressTextBar(this.current, wxaConfigs);

        // save all app configurations for compile time.
        // such as global components.
        this.app = {};

        // load from path/to/project/src/app.json
        this.appConfigs = {};

        // cmd options
        this.cmdOptions = {};

        // performance mark
        this.obs = new PerformanceObserver((list, observer) => {
            if (process.env.NODE_DEBUG==='performance') {
                console.log(list.getEntries());
            }
        });
        this.obs.observe({entryTypes: ['measure'], buffered: true});
    }

    set(name, value) {
        this[name] = value;
    }

    addEntryPoint(mdl) {
        let child = this.findOrAddDependency(mdl, ROOT);

        if (!~ROOT.childNodes.findIndex((mdl)=>mdl.src===child.src)) ROOT.childNodes.push(child);

        return child;
    }

    async doDPA() {
        if (!this.$depPending.length) {
            logger.error('找不到可编译的入口文件');
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

            // debug('file to parse %O', dep);
            tasks.push(this.$parse(dep));
        // }

        return Promise.all(tasks).then(async (succ)=>{
            if (this.$depPending.length === 0) {
                // dependencies resolve complete
                this.progress.clean();
                return Promise.resolve(succ);
            } else {
                let sub = await this.$doDPA();
                return succ.concat(sub);
            }
        });
    }

    async $parse(dep) {
        // calc hash
        // cause not every module is actually exists, we can not promise all module has hash here.
        let content = dep.content ? dep.content : readFile(dep.src);
        if (content) dep.hash = crypto.createHash('md5').update(content).digest('hex');
        debug('Dep HASH: %s', dep.hash);
        try {
            const relativeSrc = path.relative(this.current, dep.src);
            const text = this.cmdOptions.verbose ? `(Hash: ${dep.hash})    ${relativeSrc}` : relativeSrc;

            this.progress.draw(text, 'COMPILING', !this.cmdOptions.verbose);

            performance.mark(`loader started ${dep.src}`);

            // loader: use custom compiler to load resource.
            await this.loader.compile(dep);

            performance.mark(`loader end ${dep.src}`);
            performance.measure(`loader timing ${dep.src}`, `loader started ${dep.src}`, `loader end ${dep.src}`);

            // try to wrap wxa every app and page
            this.tryWrapWXA(dep);
            this.tryAddPolyfill(dep);

            // performance.mark(`compiler started ${dep.src}`);

            // Todo: conside if cache is necessary here.
            // debug('dep to process %O', dep);
            let compiler = new Compiler(this.wxaConfigs.resolve, this.meta, this.appConfigs);
            let childNodes = await compiler.parse(dep);

            // performance.mark(`compiler end ${dep.src}`);

            // performance.measure('compiler timing ', `compiler started ${dep.src}`, `compiler end ${dep.src}`);

            debug('childNodes', childNodes.map((node)=>simplify(node)));
            let children = childNodes.reduce((children, node)=>{
                let child = this.findOrAddDependency(node, dep);

                if (child) return children.concat(child);

                return children;
            }, []);


            // if watch mode, use childNodes to clean up the dep tree.
            // update each module's childnodes, then according to reference unlink file.
            this.cleanUpChildren(children, dep);

            // cover new childNodes
            dep.childNodes = new Set(children);
            dep.color = COLOR.COMPILED;

            // if module is app.json, then add Page entry points.
            if (dep.meta && dep.meta.source === this.APP_CONFIG_PATH) {
                this.appConfigs = {...dep.json};
                debug('app configs is %O', dep.json);

                if (dep.json['wxa.globalComponents']) {
                    // global components in wxa;
                    // delete custom field in app.json or wechat devtool will get wrong.
                    delete dep.json['wxa.globalComponents'];

                    dep.code = JSON.stringify(dep.json, void(0), 4);
                }

                let oldPages = this.$pageArray.slice(0);
                let newPages = this.addPageEntryPoint();
                this.cleanUpPages(newPages, oldPages);
            }

            this.calcFileSize(dep);

            // tick event
            // this.emit('tick', dep);
            return dep;
        } catch (e) {
            debug('编译失败 %O', e);
            throw e;
        }
    }

    cleanUpChildren(newChildren, mdl) {
        debug('clean up module %O', simplify(mdl));
        if (mdl.childNodes == null) return;

        mdl.childNodes.forEach((oldChild)=>{
            if (!~newChildren.findIndex((item)=>item.src === oldChild.src)) {
                // child node not used, update reference.
                debug('denpendencies clean up started');

                if (oldChild.reference == null) {
                    debug('Error: old child node\'s reference is no find %O', simplify(oldChild) );
                    return;
                }

                let idxOfParent = oldChild.reference.findIndex((ref)=>ref.parent.src === mdl.src);
                debug('find index %s', idxOfParent);

                if (idxOfParent === -1) {
                    debug('Error: do not find parent module');
                    return;
                }

                oldChild.reference.splice(idxOfParent, 1);

                // debug('oldChild %O', oldChild);

                if (oldChild.reference.length === 0 && !oldChild.isROOT) {
                    debug('useless module find %s', oldChild.src);

                    // nested clean children
                    this.cleanUpChildren([], oldChild);
                    // unlink module
                    oldChild.meta && oldChild.meta.accOutputPath && unlinkSync(oldChild.meta.accOutputPath);
                    this.$indexOfModule.splice(this.$indexOfModule.findIndex((mdl)=>mdl.src===oldChild.src), 1);
                }
            }
        });
    }

    cleanUpPages(newPages, oldPages) {
        let droppedPages = oldPages.filter((oldPage)=>newPages.findIndex((page)=>page.src===oldPage.src)===-1);

        droppedPages.forEach((droppedPage)=>{
            debug('dropped page %O', droppedPage);
            // nested clean up children module
            this.cleanUpChildren([], droppedPage);

            // drop page from pageArray;
            let idxOfPage = this.$pageArray.findIndex((page)=>page.src===droppedPage.src);
            if (idxOfPage>-1) this.$pageArray.splice(idxOfPage, 1);

            // drop module from index
            let idxOfModule = this.$indexOfModule.findIndex((mdl)=>mdl.src===droppedPage.src);
            if (idxOfModule>-1) this.$indexOfModule.splice(idxOfModule, 1);

            if (droppedPage.meta && !droppedPage.isAbstract) {
                unlinkSync(droppedPage.meta.accOutputPath);
            }
        });
    }

    findOrAddDependency(dep, mdl) {
        // if a dependency is from remote, or dynamic path, or base64 format, then we ignore it.
        // cause we needn't process this kind of resource.
        if (dep.pret.isURI || dep.pret.isDynamic || dep.pret.isBase64) return null;

        debug('Find Dependencies started %O', simplify(dep));

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

        if (!child.isFile) {
            let content = child.content || readFile(child.src);
            child.hash = crypto.createHash('md5').update(content).digest('hex');
        }

        if (indexedModuleIdx > -1) {
            let indexedModule = this.$indexOfModule[indexedModuleIdx];
            let ref = child.reference;
            debug('Find out module HASH is %s %O', indexedModule.hash, indexedModule);

            // merge from.
            if (Array.isArray(indexedModule.reference)) {
                indexedModule.reference.push(ref);
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

    tryWrapWXA(mdl) {
        if (
            ~['app', 'component', 'page'].indexOf(mdl.category ? mdl.category.toLowerCase() : '') &&
            mdl.meta && path.extname(mdl.meta.source) === '.js' &&
            /exports\.default/gm.test(mdl.code)
        ) {
            mdl.code = wrapWxa(mdl.code, mdl.category, mdl.pagePath);
            debug('wrap dependencies %O', simplify(mdl));
        }
    }

    tryAddPolyfill(mdl) {
        if (!this.wxaConfigs.polyfill) return;

        const polyfill = new Map([
            ['regenerator-runtime/runtime', {
                test(mdl) {
                    // if js file do not have regeneratorRuntime polyfill
                    // or babelRuntime polyfill we add it.
                    return (
                        mdl.meta && path.extname(mdl.meta.source) === '.js' &&
                        /regeneratorRuntime/.test(mdl.code) &&
                        !/var\sregeneratorRuntime \=/.test(mdl.code) &&
                        !/@babel\/runtime\/regenerator/.test(mdl.code)
                    );
                },
                wrap(mdl) {
                    mdl.code = `
                    var regeneratorRuntime = require('wxa://regenerator-runtime/runtime');

                    ${mdl.code}
                    `;
                },
            }],
            ['es.promise.finally', {
                    test(mdl) {
                        return mdl.category && ~['app'].indexOf(mdl.category.toLowerCase()) &&
                        mdl.meta && path.extname(mdl.meta.source) === '.js';
                    },
                    wrap(mdl) {
                        mdl.code = `
                        require('wxa://core-js/es.promise.finally.js');

                        ${mdl.code}
                        `;
                    },
                },
            ],
        ]);

        polyfill.forEach((preset, name)=>{
            if (this.wxaConfigs.polyfill[name] && preset.test(mdl)) preset.wrap(mdl);
        });
    }

    addPageEntryPoint() {
        // ToDo: drop entry point and clean up children after page entry point update.
        if (
            this.appConfigs == null ||
            !this.appConfigs.pages ||
            !this.appConfigs.pages.length
        ) {
            logger.error('app页面配置缺失, 请检查app.json的pages配置项');
        }

        let pages = this.appConfigs.pages;
        // multi packages process.
        // support both subpackages and subPackages
        // see: https://developers.weixin.qq.com/miniprogram/dev/framework/subpackages/basic.html
        let pkg = this.appConfigs.subpackages || this.appConfigs.subPackages;

        if (pkg) {
            let subPages = pkg.reduce((subPkgs, pkg)=>{
                return subPkgs.concat(pkg.pages.map((subpath)=>pkg.root.replace(/\/$/, '')+'/'+subpath));
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
        let newPages = pages.reduce((ret, page)=>{
            // wxa file
            let wxaPage = path.join(this.meta.context, page+this.meta.wxaExt);

            debug('page %s %s', wxaPage, page);
            let dr = new DependencyResolver(this.wxaConfigs.resolve, this.meta);

            if (isFile(wxaPage)) {
                try {
                    let pagePoint = this.addEntryPoint({
                        content: readFile(wxaPage),
                        src: wxaPage,
                        category: 'Page',
                        pagePath: page,
                        pret: defaultPret,
                        isAbstract: true,
                        meta: {
                            source: wxaPage,
                        },
                    });

                    return ret.concat([pagePoint]);
                } catch (e) {
                    logger.error(e);
                }
            } else {
                let sections = globby.sync(path.join(this.meta.context, page+'.*'));

                sections.forEach((section)=>{
                    if (isFile(section)) {
                        let outputPath = dr.getOutputPath(section, defaultPret, ROOT);
                        let pagePoint = this.addEntryPoint({
                            content: readFile(section),
                            src: section,
                            category: 'Page',
                            pagePath: page,
                            pret: defaultPret,
                            meta: {
                                source: section,
                                outputPath,
                            },
                        });

                        ret.push(pagePoint);
                    }
                });

                return ret;
            }
        }, []);

        newPages.forEach((pagePoint)=>tryPush(pagePoint));

        return newPages;
    }

    calcFileSize(dep) {
        if (dep.isFile || dep.kind === 'wxa') {
            let stat = fs.statSync(dep.src);

            dep.size = stat['size'];
        } else if (dep.code) {
            dep.size = Buffer.byteLength(dep.code, 'utf8');
        } else {
            dep.size = 0;
        }
    }
}

export default Schedule;
