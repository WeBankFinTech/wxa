import sass from 'node-sass';
import path from 'path';
import {readFile, getDistPath, writeFile, amazingCache, getConfig} from './utils';
import {info} from '../dist/utils';

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
        let configs = {};
        try {
            configs = getConfig().compiler.sass;
        } catch (e) {
            // info('项目没有sass配置');
        }
        if (typeof rst === 'string') {
            rst = [{
                type: rst,
                code: readFile(path.join(opath.dir, opath.base)) || '',
            }];
        }

        let promises = rst.map((style)=>{
            let lang = 'sass';
            const content = style.code;
            let filepath = style.src ? style.src : path.join(opath.dir, opath.base);
            // return compileSass(content, filepath, configs);
            return amazingCache({
                source: content,
                options: {filepath, configs},
                transform: function(source, options) {
                    return compileSass(content, options.filepath, options.configs).then((css)=>css.toString());
                },
            });
        });

        Promise.all(promises).then((rets)=>{
            let allContent = rets.join('');

            let target = getDistPath(opath, 'wxss', this.src, this.dist);
            // console.log(target);
            writeFile(target, allContent);
        }).catch((e)=>{
            console.error(e);
        });
    }
}

