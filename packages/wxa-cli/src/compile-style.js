import path from 'path';
import {readFile, getDistPath, writeFile, amazingCache, info, error} from './utils';
import compilerLoader from './loader';

export default class CStyle {
    constructor(src, dist, ext, options) {
        this.current = process.cwd();
        this.src = src;
        this.dist = dist;
        this.ext = ext;
        this.options = options || {};
    }

    compile(rst, opath) {
        if (typeof rst === 'string') {
            rst = [{
                type: rst,
                code: readFile(path.join(opath.dir, opath.base)) || '',
            }];
        }

        let promises = rst.map((style)=>{
            const content = style.code;

            let compiler = compilerLoader.get(style.type);
            return amazingCache({
                source: content,
                options: {configs: compiler.configs},
                transform: function(source, options) {
                    return compiler.parse(content, options.configs, path.join(opath.dir, opath.base));
                },
            });
        });

        return Promise.all(promises).then((rets)=>{
            let allContent = rets.join('');

            let target = getDistPath(opath, 'wxss', this.src, this.dist);
            // console.log(target);
            info('write', path.relative(this.current, target));
            writeFile(target, allContent);
        }, this.options.cache).catch((e)=>{
            if (e.column) {
                error('column: '+e.column+' line: '+e.line);
            }
            error(e);
        });
    }
}

