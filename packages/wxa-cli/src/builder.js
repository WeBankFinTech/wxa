import 'babel-polyfill';

import {readFile, applyPlugins} from './utils';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import chokidar from 'chokidar';
import globby from 'globby';
import debugPKG from 'debug';

import Schedule from './schedule';
import logger from './helpers/logger';
import compilerLoader from './loader';
import defaultPret from './const/defaultPret';
import Optimizer from './optimizer';
import Generator from './generator';
import {AsyncParallelHook, SyncBailHook, AsyncSeriesHook} from 'tapable';
import DependencyResolver from './helpers/dependencyResolver';
import root from './const/root';

let debug = debugPKG('WXA:Builder');

class Builder {
    constructor(wxaConfigs) {
        this.current = process.cwd();
        this.wxaConfigs = wxaConfigs;

        // default wxa configurations.
        if (!this.wxaConfigs.resolve || !this.wxaConfigs.resolve.extensions) {
            // wxa context, absolute path in wxa application will use this
            this.wxaConfigs.context = this.wxaConfigs.context || path.resolve(this.current, 'src');

            this.wxaConfigs.resolve = {
                wxaExt: '.wxa',
                extensions: ['.js', '.json'],
                appConfigPath: path.join(this.wxaConfigs.context, 'app.json'),
                ...this.wxaConfigs.resolve,
            };

            this.wxaConfigs.output = {
                path: path.join(this.wxaConfigs.context, 'dist'),
                ...this.wxaConfigs.output,
            };

            this.wxaConfigs.target = this.wxaConfigs.target || 'wxa';
        }

        if (this.wxaConfigs.resolve.wxaExt[0] !== '.') this.wxaConfigs.resolve.wxaExt = '.'+this.wxaConfigs.resolve.wxaExt;


        // chokidar options.
        this.isWatching = false;
        this.isWatchReady = false;

        this.appJSON = path.join(this.wxaConfigs.context, 'app.json');
        this.wxaJSON = path.join(this.wxaConfigs.context, 'app'+this.wxaConfigs.resolve.ext);

        this.hooks = {
            entryOption: new SyncBailHook(['entry']),
            beforeRun: new AsyncSeriesHook(['compiler']),
            run: new AsyncSeriesHook(['compiler']),
            done: new AsyncParallelHook(['dependencies']),
        };
    }

    async init(cmd) {
        // Todo: custome package manager, such as yarn.
        // npmManager.setup(category)

        // mount loader
        return compilerLoader
        .mount(this.wxaConfigs.use, cmd);
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
                logger.message(event, filepath);
                debug('WATCH file changed %s', filepath);
                let mdl = this.schedule.$indexOfModule.find((module)=>module.src===filepath);
                let isChange = true;
                debug('Changed Module %O', mdl);
                // module with code;
                if (mdl.code) {
                    let content = readFile(mdl.src);
                    debug('changed content %s', content);
                    let md5 = crypto.createHash('md5').update(content).digest('hex');

                    mdl.code = content;
                    isChange = mdl.hash !== md5;
                    debug('OLD HASH %s, NEW HASH %s', mdl.hash, md5);
                }

                if (isChange) {
                    let changedDeps;
                    // if (this.appJSON === mdl.src || this.wxaJSON === mdl.src) {
                        // let appConfigs = mdl.src === mdl.
                        // this.schedule.set('appConfigs', appConfigs);
                    // } else {
                    try {
                        this.schedule.$depPending.push(mdl);
                        changedDeps = await this.schedule.$doDPA();
                        await this.optimizeAndGenerate(changedDeps);
                        logger.message('Compile', '编译完成', true);
                    } catch (e) {
                        logger.errorNow('编译失败', e);
                    }


                    let newFiles = this.filterModule(this.schedule.$indexOfModule);
                    let unlinkFiles = files.filter((oldFilePath)=>!~newFiles.indexOf(oldFilePath));
                    let addFiles = newFiles.filter((filePath)=>!~files.indexOf(filePath));

                    // unwatch deleted file add watch to new Files;
                    debug('addFiles %O, unlinkFiles %O', addFiles, unlinkFiles);
                    this.watcher.add(addFiles);
                    this.watcher.unwatch(unlinkFiles);

                    files = newFiles;
                } else {
                    logger.message('Complete', '文件无变化', true);
                }
            }
        })
        .on('ready', ()=>{
            this.isWatchReady = true;
            logger.message('Watch', '准备完毕，开始监听文件', true);
        });

        let h = (code)=>{
            this.watcher.close();
            logger.messageNow('Exit', `正在关闭Wxa(${code})`);
            process.exit(0);
        };
        process.on('exit', h);
        process.on('uncaughtException', h);
        process.on('SIGINT', h);
        process.on('uncaughtException', h);
        process.on('SIGHUP', h);
    }

    async build(cmd) {
        try {
            // initial loader and entry options.
            await this.init(cmd);
        } catch (e) {
            logger.errorNow('挂载失败', e);
        }
        await this.hooks.beforeRun.promise(this);

        this.schedule = new Schedule();
        this.schedule.set('cmdOptions', cmd);
        this.schedule.set('wxaConfigs', this.wxaConfigs || {});

        debug('builder wxaConfigs is %O', this.wxaConfigs);
        debug('schedule options is %O', this.schedule);
        try {
            await this.handleEntry();
        } catch (error) {
            logger.errorNow('编译入口参数有误', error);
        }

        await this.run();

        if (cmd.watch) this.watch();
    }

    async run() {
        logger.infoNow('Compile', 'AT: '+new Date().toLocaleString(), void(0));
        try {
            await this.hooks.run.promise(this);

            // do dependencies analysis.
            await this.schedule.doDPA();
            debug('schedule dependencies Tree is %O', this.schedule.$indexOfModule);

            await this.optimizeAndGenerate(this.schedule.$indexOfModule);

            // done.
            await this.hooks.done.promise(this.schedule.$indexOfModule);

            logger.infoNow('Done', 'AT: '+new Date().toLocaleString(), void(0));
        } catch (e) {
            logger.errorNow('编译失败', e);
        }
    }

    async optimizeAndGenerate(list) {
        try {
            // module optimize, dependencies merge, minor.
            let optimizer = new Optimizer(this.schedule.wxaConfigs.resolve, this.schedule.meta);
            applyPlugins(this.schedule.wxaConfigs.plugins, optimizer);

            let optimizeTasks = list.map((dep)=>{
                return optimizer.do(dep);
            });

            await Promise.all(optimizeTasks).catch((e)=>{
                console.error(e);
            });

            // module dest, dependencies copy,
            let generator = new Generator(this.schedule.wxaConfigs.resolve, this.schedule.meta, this.schedule.wxaConfigs);
            let generateTasks = list.map((mdl)=>{
                return generator.do(mdl);
            });

            await Promise.all(generateTasks);
        } catch (e) {
            console.error(e);
        }
    }

    async handleEntry(mdl) {
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
        debug('entry after hooks %O', entry);

        entry = await globby(entry);
        debug('entry after globby %O', entry);

        entry.forEach((point)=>{
            point = path.isAbsolute(point) ? point : path.join(this.current, point);

            let dr = new DependencyResolver(this.schedule.wxaConfigs.resolve, this.schedule.meta);
            let outputPath = dr.getOutputPath(point, defaultPret, root);

            this.schedule.addEntryPoint({
                src: point,
                pret: defaultPret,
                category: isAPP(point) ? 'App' : 'Entry',
                meta: {
                    source: point,
                    outputPath,
                },
            });
        });
    }
}


export default Builder;
