import {readFile, applyPlugins, isFile, getHash, promiseSerial} from './utils';
import path from 'path';
import fs from 'fs';
import chokidar from 'chokidar';
import globby from 'globby';
import debugPKG from 'debug';

import Schedule from './schedule';
import {logger, error} from './helpers/logger';
import CompilerLoader from './loader';
import defaultPret from './const/defaultPret';
import Optimizer from './optimizer';
import Generator from './generator';
import {AsyncParallelHook, SyncBailHook, AsyncSeriesHook} from 'tapable';
import DependencyResolver from './helpers/dependencyResolver';
import root from './const/root';
import ProgressTextBar from './helpers/progressTextBar';
import color from './const/color';
import {DirectiveBroker} from './directive/directiveBroker';

let debug = debugPKG('WXA:Builder');
class Builder {
    constructor(wxaConfigs) {
        this.current = process.cwd();
        this.wxaConfigs = wxaConfigs;

        // default wxa configurations.
        this.wxaConfigs.resolve.appConfigPath = path.join(this.wxaConfigs.context, 'app.json');
        if (this.wxaConfigs.resolve.wxaExt[0] !== '.') this.wxaConfigs.resolve.wxaExt = '.'+this.wxaConfigs.resolve.wxaExt;

        // get project name,
        // priority: wxa.config -> package.json -> 'WXA';
        if (!this.wxaConfigs.name) {
            try {
                this.name = require(path.join(this.current, 'package.json')).name;
            } catch (e) {
                this.name = 'WXA';
            }
        } else {
            this.name = this.wxaConfigs.name;
        }

        // chokidar options.
        this.isWatching = false;
        this.isWatchReady = false;

        this.appJSON = path.join(this.wxaConfigs.context, 'app.json');
        this.wxaJSON = path.join(this.wxaConfigs.context, 'app'+this.wxaConfigs.resolve.ext);

        this.progress = new ProgressTextBar(this.current, this.wxaConfigs);

        this.hooks = {
            entryOption: new SyncBailHook(['entry']),
            beforeRun: new AsyncSeriesHook(['compiler']),
            run: new AsyncSeriesHook(['compiler']),
            done: new AsyncParallelHook(['compilation']),
            rebuildModule: new AsyncSeriesHook(['changedModule']),
            finishRebuildModule: new AsyncParallelHook(['compilation', 'changedModule']),
        };
    }

    async init(cmd) {
        // Todo: custome package manager, such as yarn.
        // npmManager.setup(category)

        // mount loader
        this.loader = new CompilerLoader(this.wxaConfigs, this.current);
        return this.loader.mount(this.wxaConfigs.use, cmd);
    }

    filterModule(indexedMap) {
        let ret = new Set();
        indexedMap.forEach((dep)=>{
            if (
                !/src\/_wxa/.test(dep.src)
            ) {
                ret.add(dep.src);
            }

            if (dep.outerDependencies) {
                // logger.info('Outer Dependencies ', dep.outerDependencies);
                // if an outer dependencies is change, just compile the module is depended.
                dep.outerDependencies.forEach((file)=>ret.add(`${file}`));
            }
        });

        return Array.from(ret);
    }

    watch(cmd) {
        if (this.isWatching || this.watcher) return;
        this.isWatching = true;

        // set mode
        this.scheduler.set('mode', 'watch');

        let files = this.filterModule(this.scheduler.$indexOfModule);

        if (cmd.verbose) {
            logger.info('File to Watch ', files.length);
        }

        this.watcher = chokidar.watch(files, {
            awaitWriteFinish: {
                stabilityThreshold: 300,
                pollInterval: 100,
            },
        })
        .on('change', async (filepath)=>{
            if (this.isWatchReady && !this.isDoingUpade) {
                this.isDoingUpade = true;

                logger.warn('change', filepath);
                debug('WATCH file changed %s', filepath);
                let mdl = this.scheduler.$indexOfModule.get(filepath);

                if (mdl == null) {
                    // maybe outer dependencies.
                    let defer = [];

                    let addTask = (mdl)=>{
                        defer.push(async ()=>{
                            try {
                                this.scheduler.$depPending.push(mdl);
                                // 2019-08-20 childNodes will auto mark in scheduler
                                // if (mdl.childNodes && mdl.childNodes.size) this.walkChildNodesTreeAndMark(mdl);
                                mdl.color = color.CHANGED;

                                await this.hooks.rebuildModule.promise(this.scheduler, mdl);

                                let changedDeps = await this.scheduler.$doDPA();
                                let map = new Map(changedDeps.map((mdl)=>[mdl.src, mdl]));
                                await this.optimizeAndGenerate(map, this.scheduler.appConfigs, cmd);
                            } catch (e) {
                                error('编译失败', {error: e});
                            }
                        });
                    };

                    this.scheduler.$indexOfModule.forEach((mdl)=>{
                        if (!mdl.outerDependencies || !mdl.outerDependencies.size || !mdl.outerDependencies.has(filepath)) return;

                        addTask(mdl);
                    });

                    try {
                        await promiseSerial(defer);
                    } catch (e) {
                        logger.error(e);
                    }
                } else {
                    // normol deps changed
                    let {isChange, newFiles} = await this.compileChangedFile({filepath, mdl, files, cmd}) || {};
                    if (isChange) files = newFiles;
                }

                this.isDoingUpade = false;
            }
        })
        .on('ready', ()=>{
            this.isWatchReady = true;
            logger.log('Watch', '准备完毕，开始监听文件');
        });

        let h = (code)=>{
            this.watcher.close();
            logger.warn('Exit', `正在关闭Wxa(${code})`);
            process.exit(0);
        };
        process.on('exit', h);
        process.on('uncaughtException', h);
        process.on('SIGINT', h);
        process.on('uncaughtException', h);
        process.on('SIGHUP', h);
    }

    walkChildNodesTreeAndMark(mdl) {
        // mark tree nodes as changed
        mdl.childNodes.forEach((child)=>{
            child.color = color.CHANGED;

            if (child.childNodes && child.childNodes.size) this.walkChildNodesTreeAndMark(child);
        });
    }

    async compileChangedFile({filepath, mdl, files, cmd}) {
        let isChange = true;
        debug('Changed Module %O', mdl);
        // module with code;
        if (!mdl.isFile) {
            let hash = getHash(filepath);
            isChange = mdl.hash !== hash;
            debug('OLD HASH %s, NEW HASH %s', mdl.hash, hash);
        }

        if (isChange) {
            mdl.color = color.CHANGED;
            mdl.content = void(0);
            mdl.code = void(0);

            let changedDeps;
            try {
                this.scheduler.$depPending.push(mdl);
                // 2019-08-20 childNodes will auto mark in scheduler
                // if (mdl.childNodes && mdl.childNodes.size) this.walkChildNodesTreeAndMark(mdl);

                await this.hooks.rebuildModule.promise(this.scheduler, mdl);

                changedDeps = await this.scheduler.$doDPA();
                let map = new Map(changedDeps.map((mdl)=>[mdl.src, mdl]));
                await this.optimizeAndGenerate(map, this.scheduler.appConfigs, cmd);
            } catch (e) {
                // error('编译失败', {error: e});
            }

            let newFiles = this.filterModule(this.scheduler.$indexOfModule);
            let unlinkFiles = files.filter((oldFilePath)=>!~newFiles.indexOf(oldFilePath));
            let addFiles = newFiles.filter((filePath)=>!~files.indexOf(filePath));

            // unwatch deleted file add watch to new Files;
            debug('addFiles %O, unlinkFiles %O', addFiles, unlinkFiles);
            if (cmd.verbose) {
                logger.info('Add Files', addFiles, ' COUNT:', addFiles.length);
                logger.info('Unwatch Files', unlinkFiles, ' COUNT:', unlinkFiles.length);
            }

            if (addFiles && addFiles.length) this.watcher.add(addFiles);
            if (unlinkFiles && unlinkFiles.length) this.watcher.unwatch(unlinkFiles);

            await this.hooks.finishRebuildModule.promise(this.scheduler, mdl);

            return {isChange, newFiles};
        } else {
            logger.info(`文件无变化(${mdl.hash})`);
        }
    }

    async build(cmd) {
        if (cmd.verbose) logger.info('WxaConfigs', this.wxaConfigs);

        try {
            // initial loader and entry options.
            await this.init(cmd);
        } catch (e) {
            error('挂载失败', {error: e});
        }
        await this.hooks.beforeRun.promise(this);

        this.scheduler = new Schedule(this.loader);
        this.directiveBroker = new DirectiveBroker(this.scheduler);

        applyPlugins(this.wxaConfigs.plugins || [], this.scheduler);
        this.scheduler.progress.toggle(cmd.progress);
        this.scheduler.set('cmdOptions', cmd);
        this.scheduler.set('wxaConfigs', this.wxaConfigs || {});
        this.scheduler.set('directiveBroker', this.directiveBroker);

        try {
            await this.handleEntry(cmd);
        } catch (err) {
            error('编译入口参数有误', {err});
            throw err;
        }

        await this.run(cmd);

        if (cmd.watch) this.watch(cmd);
    }

    async run(cmd) {
        process.title = this.name;
        logger.info('Building', `Project: ${this.name} `+'AT: '+new Date().toLocaleString());
        await this.hooks.run.promise(this);

        // do dependencies analysis.
        await this.scheduler.doDPA();
        await this.directiveBroker.run();

        this.scheduler.perf.show();

        try {
            debug('schedule dependencies Tree is %O', this.scheduler.$indexOfModule);
            await this.optimizeAndGenerate(this.scheduler.$indexOfModule, this.scheduler.appConfigs, cmd);

            // done.
            await this.hooks.done.promise(this.scheduler);

            debug('Project Pages', this.scheduler.$pageArray);

            logger.log('Done', 'AT: '+new Date().toLocaleString());
        } catch (e) {
            error('编译失败', {error: e});
        }
    }

    /**
     *
     * optimize all module in list and generate dest file.
     * optiming and generating is parallel.
     *
     * @param {Array<Object>} indexedMap
     * @param {Object} cmdOptions cmd options
     */
    async optimizeAndGenerate(indexedMap, appConfigs, cmdOptions) {
        try {
            // module optimize, dependencies merge, minor.
            let optimizer = new Optimizer({
                cwd: this.current,
                wxaConfigs: this.wxaConfigs,
                cmdOptions: cmdOptions,
                appConfigs: appConfigs,
            });
            applyPlugins(this.scheduler.wxaConfigs.plugins, optimizer);

            await optimizer.run(indexedMap);

            // write module to dest, dependencies copy.
            let generator = new Generator(this.current, this.scheduler.meta, this.wxaConfigs, cmdOptions);
            let generateTasks = [];
            indexedMap.forEach((mdl)=>{
                generateTasks.push(generator.do(mdl));
            });

            await Promise.all(generateTasks);

            this.progress.clean();
        } catch (e) {
            debugger;
            logger.error(e);
            this.progress.draw('\n');
        }
    }

    async handleEntry(cmd) {
        let entry = this.scheduler.wxaConfigs.entry || [];
        if (!Array.isArray(entry)) throw new Error('Entry Point is not array!');

        let isAPP = (filepath)=>/app\./.test(filepath);
        // default entry
        if (!entry.length) {
            let files = fs.readdirSync(path.join(this.current, this.src));

            entry = files
            .filter((f)=>fs.statSync(path.join(this.current, this.src, f)).isFile)
            .filter((f)=>isAPP(f))
            .map((f)=>path.join(this.current, this.src, f));
        }

        entry = this.hooks.entryOption.call(entry) || entry;
        // debug('entry after hooks %O', entry);

        entry = await globby(entry);
        entry = entry.map((item)=>item.replace(/\//g, path.sep));
        debug('entry after globby %O', entry);

        entry.forEach((point)=>{
            let mdl = {};
            point = path.isAbsolute(point) ? point : path.join(this.current, point);

            if (this.wxaConfigs.point) {
                let matchedPoint = Object.keys(this.wxaConfigs.point).find((key)=>new RegExp(key).test(point));
                // console.log(matchedPoint);

                if (matchedPoint) {
                    mdl.src = this.wxaConfigs.point[matchedPoint];
                    mdl.content = readFile(this.wxaConfigs.point[matchedPoint]);
                }
            }

            let dr = new DependencyResolver(this.scheduler.wxaConfigs.resolve, this.scheduler.meta);
            let outputPath = dr.getOutputPath(point, defaultPret, root);

            mdl = {
                src: point,
                pret: defaultPret,
                category: isAPP(point) ? 'App' : 'Entry',
                meta: {
                    source: point,
                    outputPath,
                },
                ...mdl,
            };

            if (isFile(mdl.src)) {
                this.scheduler.addEntryPoint(mdl);
            } else {
                throw new Error(`入口文件不存在 ${mdl.src}`);
            }
        });
    }
}

export function spawnBuilder(configs, cmdOptions) {
    let projects = cmdOptions.project;

    for (let name of projects) {
        let projectConfigs = configs.find((item)=> item.name === name);

        if (!projectConfigs) {
            logger.error(`找不到${name}的项目配置文件，请检查wxa.config.js中的三方配置`);
            break;
        }

        let builder = new Builder(projectConfigs);

        applyPlugins(builder.wxaConfigs.plugins || [], builder);

        builder.build(cmdOptions);
    }
}

export default Builder;
