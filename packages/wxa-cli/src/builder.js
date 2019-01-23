import {readFile, applyPlugins, isFile} from './utils';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import chokidar from 'chokidar';
import globby from 'globby';
import debugPKG from 'debug';

import Schedule from './schedule';
import logger from './helpers/logger';
import CompilerLoader from './loader';
import defaultPret from './const/defaultPret';
import Optimizer from './optimizer';
import Generator from './generator';
import {AsyncParallelHook, SyncBailHook, AsyncSeriesHook} from 'tapable';
import DependencyResolver from './helpers/dependencyResolver';
import root from './const/root';
import ProgressTextBar from './helpers/progressTextBar';

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
        if (!this.wxaConfigs.$name) {
            try {
                this.name = require(path.join(this.current, 'package.json')).name;
            } catch (e) {
                this.name = 'WXA';
            }
        } else {
            this.name = this.wxaConfigs.$name;
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

    filterModule(arr) {
        return arr.reduce((ret, dep)=>{
            if (
                !/src\/_wxa/.test(dep.src)
            ) {
                ret.push(dep.src);
            }


            return ret;
        }, []);
    }

    watch(cmd) {
        if (this.isWatching) return;
        this.isWatching = true;

        // set mode
        this.schedule.set('mode', 'watch');

        let files = this.filterModule(this.schedule.$indexOfModule);
        // console.log(files);

        this.watcher = chokidar.watch(files, {
            awaitWriteFinish: {
                stabilityThreshold: 300,
                pollInterval: 100,
            },
        })
        .on('all', async (event, filepath)=>{
            if (this.isWatchReady && ~['change'].indexOf(event)) {
                logger.warn(event, filepath);
                debug('WATCH file changed %s', filepath);
                let mdl = this.schedule.$indexOfModule.find((module)=>module.src===filepath);
                let isChange = true;
                debug('Changed Module %O', mdl);
                // module with code;
                if (!mdl.isFile) {
                    let content = readFile(mdl.src);
                    debug('changed content %s', content);
                    let md5 = crypto.createHash('md5').update(content).digest('hex');

                    mdl.content = content;
                    mdl.code = void(0);
                    isChange = mdl.hash !== md5;
                    debug('OLD HASH %s, NEW HASH %s', mdl.hash, md5);
                }

                if (isChange) {
                    let changedDeps;
                    try {
                        this.schedule.$depPending.push(mdl);

                        await this.hooks.rebuildModule.promise(this.schedule, mdl);

                        changedDeps = await this.schedule.$doDPA();
                        await this.optimizeAndGenerate(changedDeps);
                        logger.log('Done', '编译完成');
                        debug('schedule dependencies Tree is %O', this.schedule.$indexOfModule);
                    } catch (e) {
                        logger.error('编译失败', e);
                    }

                    let newFiles = this.filterModule(this.schedule.$indexOfModule);
                    let unlinkFiles = files.filter((oldFilePath)=>!~newFiles.indexOf(oldFilePath));
                    let addFiles = newFiles.filter((filePath)=>!~files.indexOf(filePath));

                    // unwatch deleted file add watch to new Files;
                    debug('addFiles %O, unlinkFiles %O', addFiles, unlinkFiles);
                    this.watcher.add(addFiles);
                    this.watcher.unwatch(unlinkFiles);

                    files = newFiles;

                    await this.hooks.finishRebuildModule.promise(this.schedule, mdl);
                } else {
                    logger.info(`文件无变化(${mdl.hash})`);
                }
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

    async build(cmd) {
        if (cmd.verbose) logger.info('WxaConfigs', this.wxaConfigs);

        try {
            // initial loader and entry options.
            await this.init(cmd);
        } catch (e) {
            logger.error('挂载失败', e);
        }
        await this.hooks.beforeRun.promise(this);

        this.schedule = new Schedule(this.loader);
        this.schedule.progress.toggle(cmd.progress);
        this.schedule.set('cmdOptions', cmd);
        this.schedule.set('wxaConfigs', this.wxaConfigs || {});

        debug('builder wxaConfigs is %O', this.wxaConfigs);
        debug('schedule options is %O', this.schedule);
        try {
            await this.handleEntry(cmd);
        } catch (error) {
            logger.error('编译入口参数有误', error);
            throw error;
        }

        await this.run(cmd);

        if (cmd.watch) this.watch();
    }

    async run(cmd) {
        process.title = this.name;
        logger.info('Building', `Project: ${this.name} `+'AT: '+new Date().toLocaleString());
        try {
            await this.hooks.run.promise(this);

            // do dependencies analysis.
            await this.schedule.doDPA();
            debug('schedule dependencies Tree is %O', this.schedule.$indexOfModule.map((item)=>{
                delete item.ast;
                delete item.xml;

                if (item.reference) delete item.reference;

                return item;
            }));

            await this.optimizeAndGenerate(this.schedule.$indexOfModule);

            // done.
            await this.hooks.done.promise(this.schedule);

            logger.log('Done', 'AT: '+new Date().toLocaleString());
        } catch (e) {
            logger.error('编译失败', e);
        }
    }

    async optimizeAndGenerate(list) {
        try {
            // module optimize, dependencies merge, minor.
            let optimizer = new Optimizer(this.wxaConfigs);
            applyPlugins(this.schedule.wxaConfigs.plugins, optimizer);

            let optimizeTasks = list.map((dep)=>{
                this.progress.draw(dep.src, 'Optimizing');
                return optimizer.do(dep);
            });

            await Promise.all(optimizeTasks).catch((e)=>{
                this.progress.clean();
                logger.error(e);
            });

            this.progress.clean();
            // module dest, dependencies copy,
            let generator = new Generator(this.schedule.wxaConfigs.resolve, this.schedule.meta, this.schedule.wxaConfigs);
            let generateTasks = list.map((mdl)=>{
                this.progress.draw(mdl.src, 'Generating');
                return generator.do(mdl);
            });

            await Promise.all(generateTasks);
            this.progress.clean();
        } catch (e) {
            this.progress.clean();
            logger.error(e);
        }
    }

    async handleEntry(cmd) {
        let entry = this.schedule.wxaConfigs.entry || [];
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

            if (cmd.multi) {
                let matchedPoint = Object.keys(this.wxaConfigs.thirdParty.point).find((key)=>new RegExp(key).test(point));
                // console.log(matchedPoint);

                if (matchedPoint) {
                    mdl.src = this.wxaConfigs.thirdParty.point[matchedPoint];
                    mdl.content = readFile(this.wxaConfigs.thirdParty.point[matchedPoint]);
                }
            }

            let dr = new DependencyResolver(this.schedule.wxaConfigs.resolve, this.schedule.meta);
            let outputPath = dr.getOutputPath(point, defaultPret, root);

            // debug('entry point %O', {
            //     src: point,
            //     pret: defaultPret,
            //     category: isAPP(point) ? 'App' : 'Entry',
            //     meta: {
            //         source: point,
            //         outputPath,
            //     },
            //     ...mdl,
            // });

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
                this.schedule.addEntryPoint(mdl);
            } else {
                throw new Error(`入口文件不存在 ${mdl.src}`);
            }
        });
    }
}


export default Builder;
