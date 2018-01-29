import {getConfig, getFiles, readFile, isFile, error, getRelative, info, copy, applyPlugins, message} from './utils';
import path from 'path';
import CWxa from './compile-wxa';
import CScript from './compile-script';
import CStyle from './compile-style';
import chokidar from 'chokidar';
import schedule from './schedule';
import CConfig from './compile-config';

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
    watch(cmd) {
        if (this.isWatching) return;
        this.isWatching = true;

        chokidar.watch(`.${path.sep}${this.src}`)
        .on('all', (event, filepath)=>{
            if (this.isWatchReady && ['change', 'add'].indexOf(event)>-1 && !this.queue[filepath]) {
                message(event, filepath);
                this.queue[filepath] = event;
                cmd.file = path.join('..', filepath); ;
                this.build(cmd);
                setTimeout(()=>this.queue[filepath]=false, 500);
            }
        })
        .on('ready', (event, filepath)=>{
            this.isWatchReady = true;
            info('Watch', '准备完毕，开始监听文件');
        });
    }
    build(cmd) {
        let config = getConfig();

        config.source = this.src;
        config.dist = this.dist;
        config.ext = this.ext;

        let file = cmd.file;
        let files = file ? [file] : getFiles(this.src);

        info('Compile', 'start '+new Date());
        files.forEach((file)=>{
            let opath = path.parse(path.join(this.current, this.src, file));
            if (file) {
                this.compile(opath);
            } else {
                let refs = this.findReference(file);
                if (!refs.length) this.compile(opath);
            }
        });

        if (cmd.watch) {
            this.watch(cmd);
        }
    }
    compile(opath) {
        if (!isFile(opath)) {
            error('不存在文件:' + getRelative(opath));
            return;
        }

        switch (opath.ext) {
            case this.ext: {
                let cWxa = new CWxa(this.src, this.dist, this.ext);
                cWxa.compile(opath);
                break;
            }
            case '.sass':
            case '.scss': {
                let cStyle = new CStyle(this.src, this.dist, '.ext');
                schedule.push(cStyle.compile('sass', opath));
                break;
            }
            case '.js': {
                let cScript = new CScript(this.src, this.dist, '.js');
                cScript.compile('babel', null, 'js', opath);
                break;
            }
            case '.json': {
                let cConfig = new CConfig(this.src, this.dist);
                applyPlugins(cConfig);
                cConfig.compile(void(0), opath);
                break;
            }
            default:
                info('copy', path.join(opath.dir, opath.base));

                schedule.push(copy(opath, opath.ext, this.src, this.dist));
        }
    }
}


export default new Compiler();
