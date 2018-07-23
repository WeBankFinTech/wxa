import {getDistPath, writeFile, readFile, info, error} from './utils';
import {amazingCache} from './utils';
import {AsyncSeriesHook} from 'tapable'
import compilerLoader from './loader';
import path from 'path';
import logger from './helpers/logger';

export default class CTemplate {
    constructor(src, dist, ext, options) {
        this.current = process.cwd();
        this.src = src;
        this.dist = dist;
        this.ext = ext;

        this.$sourceType = 'wxml';
        this.options = options || {};

        this.hooks = {
            optimizeAssets: new AsyncSeriesHook(['opath', 'compilation']),
        };
    }
    compile(rst, opath) {
        if (typeof rst === 'string') {
            let filepath = path.join(opath.dir, opath.base);
            rst = {
                type: rst,
                src: filepath,
                code: readFile(filepath) || '',
            };
        }

        let compiler = compilerLoader.get(rst.type);
        return amazingCache({
            source: rst.code,
            options: {configs: {}},
            transform: function(source, options) {
                return compiler.parse(source, options);
            },
        }, this.options.cache).then((succ)=>{
            let code;
            if(typeof succ === 'string') {
                code = succ;
            } else {
                code = succ.code;
            }
            // console.log('编译前', code);
            this.code = code;
            this.$sourceFrom = rst.type;
            // console.log(this)
            return this.hooks.optimizeAssets.promise(opath, this).then((err)=>{
                if(err) Promise.reject(err);

                // console.log('编译后', this.code);
                let target = getDistPath(path.parse(rst.src), 'wxml', this.src, this.dist);
                logger.info('write', path.relative(this.current, target));
                writeFile(target, this.code);
            });
        }).catch((e)=>logger.errorNow('Error In: '+path.join(opath.dir, opath.base), e));
    }
}
