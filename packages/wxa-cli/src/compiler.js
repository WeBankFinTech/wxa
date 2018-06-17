import {getConfig, getFiles, readFile, isFile, error, getRelative, info, copy, applyPlugins, message} from './utils';
import path from 'path';
import chokidar from 'chokidar';
import schedule from './schedule';
import logger from './helpers/logger';
import compilerLoader from './loader';
import {green} from 'chalk';

class Compiler {
    constructor(src, dist, ext) {
        this.current = process.cwd();
        this.src = src || 'src';
        this.dist = dist || 'dist';
        this.ext = ext || '.wxa';
        this.isWatching = false;
        this.isWatchReady = false;
        this.queue = {};
        this.init();
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
        compilerLoader
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

        chokidar.watch(`.${path.sep}${this.src}`)
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
    build(cmd) {
        let config = getConfig();

        config.source = this.src;
        config.dist = this.dist;
        config.ext = this.ext;

        let file = cmd.file;
        let files = file ? [file] : getFiles(this.src);

        schedule.set('src', this.src);
        schedule.set('dist', this.dist);
        schedule.set('options', cmd);

        logger.infoNow('Compile', 'AT: '+new Date(), void(0));
        schedule.once('finish', (n)=>{
            logger.infoNow('Compile', 'End: '+new Date()+` ${green(n)} files process`, void(0));
            if (cmd.watch) this.watch(cmd);
        });
        files.forEach((file)=>{
            let opath = path.parse(path.join(this.current, this.src, file));
            // if (file) {
                schedule.addTask(opath, void(0), {category: cmd.category});
            // } else {
            //     let refs = this.findReference(file);
            //     if (!refs.length) schedule.addTask(opath);
            // }
        });

        if (cmd.category) delete cmd.category;
    }
}


export default Compiler;
