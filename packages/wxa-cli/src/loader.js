import path from 'path';
import logger from './helpers/logger';
import npmManager from './helpers/npmManager';
import debugPKG from 'debug';

let debug = debugPKG('WXA:Loader');

class CompilerLoader {
    constructor(cwd) {
        this.current = cwd;

        // all loader in queue.
        this.loaders = [];
    }

    mount(useLoaders=[], cmdOptions) {
        let coms = useLoaders.map((loader)=>{
            let Loader;
            let uri;
            if (typeof loader === 'object') {
                uri = loader.name;
            } else if (typeof loader === 'string') {
                uri = loader;
            } else {
                return Promise.reject('Invalid loader config in', JSON.stringify(loader));
            }

            if (uri.indexOf('/') === 0) {
                // 绝对路径
                Loader = require(uri).default;
                debug('loader %O', Loader);
            } else {
                let compilerName = '@wxa/compiler-'+uri;
                try {
                    Loader = require(path.join(this.modulePath, compilerName)).default;
                } catch (e) {
                    logger.errorNow('未安装的编译器：'+compilerName);
                    logger.infoNow('Install', `尝试安装${compilerName}中`);
                    return npmManager.install(compilerName).then((succ)=>{
                        logger.infoNow('Success', `安装${compilerName}成功`);

                        try {
                            Loader = require(path.join(this.modulePath, compilerName)).default;
                        } catch (e) {
                            logger.errorNow('找不到编译器，请手动安装依赖！');
                            process.exit(0);
                        }

                        return {Loader, uri, loader, cmdOptions};
                    }, (fail)=>{
                        logger.errorNow(`安装编译器 ${compilerName} 失败，请尝试手动安装依赖(npm i -D ${compilerName})`, fail);
                    });
                }
            }
            return Promise.resolve({Loader, uri, loader, cmdOptions});
        });

        return Promise.all(coms)
        .then((succ)=>{
            succ.forEach(({Loader, uri, loader, cmdOptions})=>{
                try {
                    debug('loader started');
                    let options = loader.options || {};
                    let instance = new Loader(this.current, options);
                    let test = loader.test || instance.test;

                    if (test == null) throw new Error('Invalid loader config in ', JSON.stringify(loader));

                    this.loaders.push({
                        test, loader: instance, options, cmdOptions,
                    });
                } catch (e) {
                    debug('挂载compiler %s 失败原因：%O', uri, e);
                    logger.errorNow(`挂载compiler ${uri} 错误, 请检查依赖是否有正确安装`, e);
                }
            });
        });
    }

    promiseSerial(funs) {
        return funs.reduce((promise, fun)=>{
            return promise.then((result)=>fun().then(Array.prototype.concat.bind(result)));
        }, Promise.resolve([]));
    }

    async compile(mdl) {
        let tasks = [];

        let fn = async (task, mdl)=>{
            let {loader, test, cmdOptions} = task;


            if (test.test(mdl.src)) {
                debug('%s loader is working ', loader);
                try {
                    let {compileTo, code, ...rest} = await loader.parse(mdl, cmdOptions);

                    // Todo: Multi loader with one string.
                    // resource transform is normal. ig. sass->css ts->js
                    // mdl.compileTo = compileTo || path.extname(mdl.src).slice(1);
                    mdl.code = code;
                    // mdl.restResource = rest;
                } catch (e) {
                    debug('parse Error %O', e);
                    console.log(e);
                    logger.errorNow(`Error `, e);
                }
            }
        };

        for (let task of this.loaders) {
            tasks.push(()=>fn(task, mdl));
        }

        // serial promise, cause all loader that match extensions should execute one by one.
        await this.promiseSerial(tasks);
        debug('finish with module %O', mdl);
    }
}

const compilerLoader = new CompilerLoader(process.cwd());

export default compilerLoader;
