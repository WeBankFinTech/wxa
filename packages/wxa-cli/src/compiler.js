import 'babel-polyfill';

import {getConfig, getFiles, readFile, isFile} from './utils';
import path from 'path';
import chokidar from 'chokidar';
import schedule from './schedule';
import logger from './helpers/logger';
import compilerLoader from './loader';
import debugPKG from 'debug';
import {green} from 'chalk';
import defaultPret from './const/defaultPret';
import Optimizer from './optimizer';
import Generator from './generator';

let debug = debugPKG('WXA:Compiler');

class Compiler {
    constructor(src, dist, ext) {
        this.current = process.cwd();
        this.src = src || 'src';
        this.dist = dist || 'dist';
        this.ext = ext || '.wxa';
        this.isWatching = false;
        this.isWatchReady = false;
        this.queue = {};
    }
    // 找到引用的src文件
    findReference(file) {
        let files = getFiles(this.src);

        let refs = [];

        let reg = new RegExp('\\'+this.ext+'$');

        files = files.filter((f)=>reg.test(f));

        files.forEach((f)=>{
            let opath = path.parse(path.join(this.current, this.src, f));
            // console.log(opath);
            let content = readFile(opath);

            content.replace(/<(script|template|style)\s.*src\s*src=\s*['"](.*)['"]/ig, (match, tag, srcpath)=>{
                if (path.join(opath.dir, srcpath) === path.join(this.current, src, file)) {
                    refs.push(f);
                }
            });
        });

        return refs;
    }
    init() {
        // 加载编译器
        const configs = getConfig();
        schedule.set('wxaConfigs', configs || {});
        schedule.toggleMounting(true);

        // mount compilers
        const defaultCompilers = [];
        const usedCompilers = Array.from(new Set(defaultCompilers.concat(configs.use || [])));

        return compilerLoader
        .mount(usedCompilers, configs.compilers||{})
        .then(()=>{
            schedule.toggleMounting(false);
        });
    }
    watch(cmd) {
        if (this.isWatching) return;
        this.isWatching = true;

        // set mode
        schedule.set('mode', 'watch');

        chokidar.watch(`.${path.sep}${this.src}`, {
            awaitWriteFinish: {
                stabilityThreshold: 300,
                pollInterval: 100,
            },
        })
        .on('all', (event, filepath)=>{
            if (this.isWatchReady && ['change', 'add'].indexOf(event)>-1 && !this.queue[filepath]) {
                cmd.file = path.join('..', filepath);
                // schedule
                logger.message(event, filepath, true);
                this.queue[filepath] = event;
                cmd.category = event;
                this.build(cmd);
                setTimeout(()=>this.queue[filepath]=false, 500);
            }
        })
        .on('ready', (event, filepath)=>{
            this.isWatchReady = true;
            logger.message('Watch', '准备完毕，开始监听文件', true);
        });
    }
    async build(cmd) {
        let config = getConfig();

        config.source = this.src;
        config.dist = this.dist;
        config.ext = this.ext;

        let file = cmd.file;
        let files = file ? [file] : getFiles(this.src);

        schedule.set('src', this.src);
        schedule.set('dist', this.dist);
        schedule.set('options', cmd);

        logger.infoNow('Compile', 'AT: '+new Date().toLocaleString(), void(0));

        // find app.js、 app.wxa first
        let appJSON = this.src+path.sep+'app.json';
        let appJS = this.src+path.sep+'app.js';
        let wxaJSON = this.src+path.sep+'app'+this.ext;
        let isWXA = false;
        if (!isFile(appJSON) && isFile(wxaJSON)) {
            isWXA = true;
        } else {
            logger.errorNow('不存在app.json或app.wxa文件!');
        }

        try {
            await this.init();

            // debug('compiler loader init map %O', compilerLoader.map);

            let p;
            if (isWXA) {
                let compiler = compilerLoader.get('wxa');

                p = ()=>compiler.parse(void(0), void(0), wxaJSON, 'wxa');
            } else {
                p = ()=>Promise.resolve({
                    script: {
                        code: readFile(appJS),
                    },
                    config: {
                        code: require(appJSON),
                    },
                });
            }

            let ret = await p();
            let rst = ret.rst || ret;
            delete rst.template;

            let appConfigs = JSON.parse(rst.config.code);
            // mount to schedule.
            schedule.set('appConfigs', appConfigs);
            schedule.set('$pageArray', [{
                src: wxaJSON,
                rst: rst,
                type: 'wxa',
                category: 'app',
                pret: defaultPret,
            }]);

            // do dependencies analysis.
            await schedule.doDPA();
            debug('schedule dependencies Tree %O', schedule.$indexOfModule);

            // module optimize, dependencies merge, minor.
            let optimizer = new Optimizer(schedule.wxaConfigs.resolve, schedule.meta);
            let optimizeTasks = schedule.$indexOfModule.map((dep)=>{
                return optimizer.do(dep);
            });

            await Promise.all(optimizeTasks);

            // module dest, dependencies copy,
            let generator = new Generator(schedule.wxaConfigs.resolve, schedule.meta);
            let generateTasks = schedule.$indexOfModule.map((mdl)=>{
                return generator.do(mdl);
            });

            await Promise.all(generateTasks);

            // done.
        } catch (e) {
            console.error(e);
        }

        if (cmd.category) delete cmd.category;
    }
}


export default Compiler;
