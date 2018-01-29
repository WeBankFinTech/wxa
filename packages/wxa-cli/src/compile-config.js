import {getDistPath, writeFile, readFile} from './utils';
import {info} from './utils';
import path from 'path';
import {AsyncSeriesHook} from 'tapable';

class CConfig {
    constructor(src, dist) {
        this.current = process.cwd();
        this.src = src || 'src';
        this.dist = dist || 'dist';
        this.type = 'json';
        this.code = '';
        this.hooks = {
            optimizeAssets: new AsyncSeriesHook(['code', 'compilation']),
        };
    }
    compile(content, opath) {
        if (content == null) {
            content = readFile(path.join(opath.dir, opath.base));
            if (content == null) throw new Error('打开文件失败 ', path.join(opath.dir, opath.base));
        }
        this.code = content;
        return this.hooks.optimizeAssets.promise(content, this).then((err)=>{
            if (err) return Promise.reject(err);
            let target = getDistPath(opath, 'json', this.src, this.dist);
            info('Config', path.relative(this.current, target));
            writeFile(target, this.code);
        }).catch((e)=>console.error(e, content));
    }
}

export default CConfig;
