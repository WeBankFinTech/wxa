import 'babel-polyfill';

import {getConfig, getFiles, readFile, isFile} from './utils';
import path from 'path';
import crypto from 'crypto';
import chokidar from 'chokidar';
import schedule from './schedule';
import logger from './helpers/logger';
import compilerLoader from './loader';
import compiler from './compilers/index';
import debugPKG from 'debug';
import {green} from 'chalk';
import defaultPret from './const/defaultPret';
import Optimizer from './optimizer';
import Generator from './generator';
import Compiler from './compilers/index';
import {AsyncParallelHook} from 'tapable';

let debug = debugPKG('WXA:Builder');

class Builder {
    constructor(src, dist, ext) {
        this.current = process.cwd();
        this.src = src || 'src';
        this.dist = dist || 'dist';
        this.ext = ext || '.wxa';
        this.isWatching = false;
        this.isWatchReady = false;
        this.queue = {};

        this.hook = {
            done: new AsyncParallelHook(['dependencies']),
        };
    }
    async init(cmd) {
        // 加载编译器
        const configs = getConfig();
        schedule.set('wxaConfigs', configs || {});

        // Todo: custome package manager, such as yarn.
        // npmManager.setup(category)

        // mount loader
        return compilerLoader
        .mount(configs.use, cmd);
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
        schedule.set('mode', 'watch');

        let files = this.filterModule(schedule.$indexOfModule);
        console.log(files);

        let watch = chokidar.watch(files, {
            awaitWriteFinish: {
                stabilityThreshold: 300,
                pollInterval: 100,
            },
        })
        .on('all', async (event, filepath)=>{
            if (this.isWatchReady && ['change', 'add'].indexOf(event)>-1 && !this.queue[filepath]) {
                console.log(event, filepath);
                let mdl = schedule.$indexOfModule.find((module)=>module.src===filepath);
                let isChange = true;
                // module with code;
                if (mdl.code) {
                    let content = readFile(mdl.src);
                    let md5 = crypto.createHash('md5').update(content).digest('hex');

                    mdl.code = content;
                    isChange = mdl.hash !== md5;
                }

                if (isChange) {
                    schedule.$depPending.push(mdl);
                    let changedDeps = await schedule.$doDPA();

                    let generator = new Generator(schedule.wxaConfigs.resolve, schedule.meta, schedule.wxaConfigs);
                    let generateTasks = changedDeps.map((mdl)=>{
                        return generator.do(mdl);
                    });

                    await Promise.all(generateTasks);

                    logger.message('Compile', '编译完成', true);
                } else {
                    logger.message('Complete', '文件无变化', true);
                }
                // cmd.file = path.join('..', filepath);
                // // schedule
                // logger.message(event, filepath, true);
                // this.queue[filepath] = event;
                // cmd.category = event;
                // this.build(cmd);
                // setTimeout(()=>this.queue[filepath]=false, 500);
            }
        })
        .on('ready', (event, filepath)=>{
            this.isWatchReady = true;
            logger.message('Watch', '准备完毕，开始监听文件', true);
        });
    }
    async build(cmd) {
        schedule.set('src', this.src);
        schedule.set('dist', this.dist);
        schedule.set('cmdOptions', cmd);

        logger.infoNow('Compile', 'AT: '+new Date().toLocaleString(), void(0));

        // find app.js、 app.wxa first
        let appJSON = path.join(this.current, this.src, 'app.json');
        let appJS = path.join(this.current, this.src, 'app.js');
        let wxaJSON = path.join(this.current, this.src, 'app'+this.ext);
        let isWXA = false;
        if (isFile(appJSON)) {
            isWXA = false;
        } else if (!isFile(appJSON) && isFile(wxaJSON)) {
            isWXA = true;
        } else {
            logger.errorNow('不存在app.json或app.wxa文件!');
        }

        try {
            // initial loader.
            await this.init(cmd);

            // read entry file.
            let entryMdl = {
                src: wxaJSON,
                type: 'wxa',
                category: 'App',
                pret: defaultPret,
            };
            let p;
            if (isWXA) {
                p = async ()=>{
                    let compiler = new Compiler(schedule.wxaConfigs.resolve, schedule.meta);
                    let {wxa} = await compiler.$parse(void(0), void(0), wxaJSON, 'wxa', entryMdl);

                    return wxa;
                };
            } else {
                p = ()=>Promise.resolve({
                    script: {
                        code: readFile(appJS),
                    },
                    config: {
                        code: readFile(appJSON),
                    },
                });
            }

            let ret = await p();
            let rst = ret.rst || ret;
            entryMdl.rst = rst;

            let appConfigs = JSON.parse(rst.config.code);
            // mount to schedule.
            schedule.set('appConfigs', appConfigs);
            schedule.set('$pageArray', [entryMdl]);

            // do dependencies analysis.
            await schedule.doDPA();
            debug('schedule dependencies Tree is %O', schedule.$indexOfModule);

            // module optimize, dependencies merge, minor.
            let optimizer = new Optimizer(schedule.wxaConfigs.resolve, schedule.meta);
            let optimizeTasks = schedule.$indexOfModule.map((dep)=>{
                return optimizer.do(dep);
            });

            await Promise.all(optimizeTasks);

            // module dest, dependencies copy,
            let generator = new Generator(schedule.wxaConfigs.resolve, schedule.meta, schedule.wxaConfigs);
            let generateTasks = schedule.$indexOfModule.map((mdl)=>{
                return generator.do(mdl);
            });

            await Promise.all(generateTasks);

            // done.
            await this.hook.done.promise(schedule.$indexOfModule);

            console.log(cmd);
            if (cmd.watch) this.watch();
        } catch (e) {
            console.error(e);
        }
    }
}


export default Builder;
