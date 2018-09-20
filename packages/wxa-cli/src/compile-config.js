import {getDistPath, writeFile, readFile, error, isFile, warn} from './utils';
import {info} from './utils';
import path from 'path';
import {AsyncSeriesHook} from 'tapable';
import PathParser from './helpers/pathParser';
import logger from './helpers/logger';
import schedule from './schedule';

class CConfig {
    constructor(src, dist) {
        this.current = process.cwd();
        this.src = src || 'src';
        this.dist = dist || 'dist';
        this.type = 'json';
        this.$sourceType = 'json';
        this.code = '';
        this.modulesPath = path.join(this.current, 'node_modules');
        this.localVisualPath = path.join(this.current, 'local', path.sep);
        this.npmPath = path.join(this.current, dist, 'npm', path.sep);
        this.localPath = path.join(this.current, dist, 'local', path.sep);
        this.hooks = {
            optimizeAssets: new AsyncSeriesHook(['opath', 'compilation']),
        };
    }

    resolveComponents(code, opath, options={}) {
        if (!code.usingComponents) return code;

        let coms = code.usingComponents;
        // logger.infoNow('resolve ', opath);
        Object.keys(coms).forEach((key)=>{
            let com = code.usingComponents[key];
            let pret = new PathParser().parse(com);
            // logger.infoNow('com', com);
            // logger.infoNow('pret', pret);
            // logger.infoNow('options ', options);

            let source;
            let target;
            // relative path
            if (pret.isRelative) {
                source = path.join(opath.dir, com);
                if (options.type === 'npm') {
                    target = path.join(this.npmPath, path.relative(this.modulesPath, source));
                } else {
                    target = getDistPath(source, void(0), this.src, this.dist);
                    // logger.infoNow('target', target);
                }
            } else if (pret.isNodeModule) {
                source = path.join(this.modulesPath, com);
                target = path.join(this.npmPath, com);
            } else {
                // other plugin do not parse.
                coms[key] = com;
                return;
            }

            // copy npm or local components, generate new path;
            // checkout component extensions;
            let type = pret.isRelative ? void(0) : pret.isNodeModule ? 'npm' : void(0);
            let comOptions = {...options};
            comOptions.type = type || options.type;
            let extOfCom = ['.wxml', '.wxss', '.js', '.json'];
            // wxa com support
            let wxaFile = source+'.wxa';

            if (isFile(wxaFile)) {
                schedule.addTask(path.parse(wxaFile), void(0), comOptions );
            } else {
                // console.log(com)
                extOfCom.forEach((ext)=>{
                    let uri = source+ext;

                    // logger.infoNow('uri', uri);
                    if (isFile(uri)) {
                        // while js file use script compiler.
                        // nested components.
                        schedule.addTask(path.parse(uri), void(0), comOptions);
                        // file is exits
                        let target = path.join(this.npmPath, com+ext);
                        logger.info(`write com`, path.relative(this.current, target));
                        // writeFile(target, readFile(uri));
                    } else if (ext === '.json') {
                        logger.warn(com+'组件不存在json配置文件');
                    }
                });
            }
            // let target = path.join(pret.isNodeModule ? this.npmPath : this.localPath, com);
            let dist = getDistPath(opath, 'json', this.src, this.dist);
            // logger.infoNow('dist', dist);

            let resolved = './'+path.relative(path.parse(dist).dir, target).replace(/\\/g, '/');
            // logger.infoNow('resolved ', resolved);

            coms[key] = resolved;
        });
        code.usingComponents = coms;
        return code;
    }

    compile(content, opath, options) {
        // logger.infoNow('config to Compile', opath);

        if (content == null) {
            content = readFile(path.join(opath.dir, opath.base));
            if (content == null) throw new Error('打开文件失败 ', path.join(opath.dir, opath.base));
        }

        try {
            content = JSON.parse(content);
            // 编译组件
            content = this.resolveComponents(content, opath, options);
        } catch (e) {
            console.error(e);
            logger.errorNow(`ERROR IN: ${opath.dir+path.sep+opath.base}`, e);
            return Promise.reject(e);
        }

        this.code = JSON.stringify(content, void(0), 4);
        return this.hooks.optimizeAssets.promise(opath, this).then((err)=>{
            if (err) return Promise.reject(err);
            let target = getDistPath(opath, 'json', this.src, this.dist);
            logger.info('Config', path.relative(this.current, target));
            writeFile(target, this.code);
        }).catch((e)=>{
            logger.errorNow('Error In: '+path.join(opath.dir, opath.base), e);
        });
    }
}

export default CConfig;
