import sass from 'node-sass';
import path from 'path';
import {readFile, getDistPath, writeFile, amazingCache, getConfig, info} from './utils';
import CompilerLoader from './compilers/index';

function compileSass(data, file, config) {
    return new Promise((resolve, reject)=>{
        sass.render({
            ...config,
            data,
            file,
        }, (err, res)=>{
            if (err) reject(err);
            else resolve(res.css);
        });
    });
}

export default class CStyle {
    constructor(src, dist, ext) {
        this.current = process.cwd();
        this.src = src;
        this.dist = dist;
        this.ext = ext;
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
            let compilerLoader = new CompilerLoader();
            let Compiler = compilerLoader.get(style.type);
            let compiler = new Compiler(this.current);
            return amazingCache({
                source: content,
                options: {configs: compiler.configs},
                transform: function(source, options) {
                    return compiler.parse(content, options.configs);
                },
            });
        });

        return Promise.all(promises).then((rets)=>{
            let allContent = rets.join('');

            let target = getDistPath(opath, 'wxss', this.src, this.dist);
            // console.log(target);
            info('write', path.relative(this.current, target));
            writeFile(target, allContent);
        }).catch((e)=>{
            console.error(e);
        });
    }
}

