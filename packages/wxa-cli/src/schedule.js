import {getConfig, getFiles, readFile, isFile, error, getRelative, info, copy, applyPlugins, message} from './utils';
import path from 'path';
import CWxa from './compile-wxa';
import CScript from './compile-script';
import CStyle from './compile-style';
import CConfig from './compile-config';
import CTemplate from './compile-template';
import bar from './helpers/progressBar';
import logger from './helpers/logger';
import {EventEmitter} from 'events';
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
        this.max = 5;

        this.bar = bar;
        this.logger = logger;
        this.mode = 'compile';
        this.wxaConfigs = {}; // wxa.config.js
        this.$isMountingCompiler = false; // if is mounting compiler, all task will be blocked.
    }

    set(name, value) {
        this[name] = value;
    }

    parse(opath, rst, configs) {
        // console.log(count++);
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

                return r.test(pathString);
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
}
const schedule = new Schedule();

export default schedule;
