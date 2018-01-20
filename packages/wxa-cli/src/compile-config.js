import {getDistPath, writeFile} from './utils';
import {log} from 'util';
import path from 'path';

class CConfig {
    constructor(src, dist) {
        this.current = process.cwd();
        this.src = src || 'src';
        this.dist = dist || 'dist';
    }
    compile(content, opath) {
        let target = getDistPath(opath, 'json', this.src, this.dist);
        log(`[配置]写入到 ${path.relative(this.current, target)}`);
        writeFile(target, content);
    }
}

export default CConfig;
