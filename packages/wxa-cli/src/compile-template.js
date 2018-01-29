import {getDistPath, writeFile, info} from './utils';
import path from 'path';

export default class CTemplate {
    constructor(src, dist, ext) {
        this.current = process.cwd();
        this.src = src;
        this.dist = dist;
        this.ext = ext;
    }
    compile(rst) {
        // console.log(rst);
        // 暂时直接写入wxml
        let target = getDistPath(path.parse(rst.src), 'wxml', this.src, this.dist);
        info('write', target);
        writeFile(target, rst.code);
        return Promise.resolve();
    }
}
