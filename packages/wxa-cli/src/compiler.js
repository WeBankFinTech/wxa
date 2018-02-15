import {getConfig, getFiles, readFile, isFile, error, getRelative, info, copy, applyPlugins, message} from './utils';
import path from 'path';
import CWxa from './compile-wxa';
import CScript from './compile-script';
import CStyle from './compile-style';
import CConfig from './compile-config';
import CTemplate from './compile-template';
import chokidar from 'chokidar';
import schedule from './schedule';
import compilerLoader from './loader';

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
        const defaultCompilers = [];
        const usedCompilers = Array.from(new Set(defaultCompilers.concat(configs.use || [])));

        compilerLoader.mount(usedCompilers, configs.compilers||{});
    }
    watch(cmd) {
        if (this.isWatching) return;
        this.isWatching = true;

        chokidar.watch(`.${path.sep}${this.src}`)
        .on('all', (event, filepath)=>{
            if (this.isWatchReady && ['change', 'add'].indexOf(event)>-1 && !this.queue[filepath]) {
                cmd.file = path.join('..', filepath); ;
                let opath = path.parse(path.join(this.current, this.src, cmd.file));
                schedule.clear(opath);
                // schedule
                message(event, filepath);
                this.queue[filepath] = event;
                this.build(cmd);
                setTimeout(()=>this.queue[filepath]=false, 500);
            }
        })
        .on('ready', (event, filepath)=>{
            this.isWatchReady = true;
            message('Watch', '准备完毕，开始监听文件');
        });
    }
    build(cmd) {
        let config = getConfig();

        config.source = this.src;
        config.dist = this.dist;
        config.ext = this.ext;

        let file = cmd.file;
        let files = file ? [file] : getFiles(this.src);

        info('Compile', 'AT: '+new Date());
        files.forEach((file)=>{
            let opath = path.parse(path.join(this.current, this.src, file));
            if (file) {
                this.compile(opath, cmd);
            } else {
                let refs = this.findReference(file);
                if (!refs.length) this.compile(opath, cmd);
            }
        });

        if (cmd.watch) {
            this.watch(cmd);
        }
    }
    compile(opath, cmd) {
        if (!isFile(opath)) {
            error('不存在文件:' + getRelative(opath));
            return;
        }

        switch (opath.ext) {
            case this.ext: {
                let cWxa = new CWxa(this.src, this.dist, this.ext, cmd);
                cWxa.compile(opath);
                break;
            }
            case '.sass':
            case '.scss': {
                let cStyle = new CStyle(this.src, this.dist, cmd);
                cStyle.compile('sass', opath);
                break;
            }
            case '.js': {
                let cScript = new CScript(this.src, this.dist, '.js', cmd);
                applyPlugins(cScript);
                let filepath = path.join(opath.dir, opath.base);
                let type = 'other';
                if (filepath === path.join(this.current, this.src, 'app.js')) type = 'app';
                cScript.compile('js', null, type, opath);
                break;
            }
            case '.json': {
                let cConfig = new CConfig(this.src, this.dist, cmd);
                applyPlugins(cConfig);
                cConfig.compile(void(0), opath);
                break;
            }
            case '.wxml': {
                let cTemplate = new CTemplate(this.src, this.dist, cmd);
                cTemplate.compile('wxml', opath);
                break;
            }
            default:
                info('copy', path.relative(this.current, path.join(opath.dir, opath.base)) );

                copy(opath, opath.ext, this.src, this.dist);
        }
    }
}


export default Compiler;
