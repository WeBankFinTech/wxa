import {getDistPath, writeFile} from './utils';
import {log} from 'util';
import path from 'path';
import {AsyncSeriesHook} from 'tapable';

class CConfig {
    constructor(src, dist) {
        this.current = process.cwd();
        this.src = src || 'src';
        this.dist = dist || 'dist';
        this.type = 'json';
        this.hooks = {
            optimizeAssets: new AsyncSeriesHook(['code', 'compilation']),
        };
    }
    compile(content, opath) {
        this.code = content;
        return this.hooks.optimizeAssets.promise(content, this).then((err)=>{
            if (err) return Promise.reject(err);
            let target = getDistPath(opath, 'json', this.src, this.dist);
            log(`[配置]写入到 ${path.relative(this.current, target)}`);
            writeFile(target, this.code);
        }).catch((e)=>console.error(e, content));
    }
}

export default CConfig;
