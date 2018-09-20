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
            } else {
                let compilerName = '@wxa/compiler-'+uri;
                try {
                    Loader = require(path.join(this.modulePath, compilerName)).default;
                } catch (e) {
                    logger.errorNow('未安装的编译器：'+compilerName);
                    logger.infoNow('Install', `尝试安装${compilerName}`);
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
                    let options = loader.options || {};
                    let instance = new Loader(this.current, options);
                    let test = loader.test || instance.test;

                    if (test == null) throw new Error('Invalid loader config in ', JSON.stringify(loader));

                    this.loaders.push({
                        test, loader: instance, options, cmdOptions,
                    });
                } catch (e) {
                    logger.errorNow(`挂载compiler ${uri} 错误, 请检查依赖是否有正确安装`, e);
                }
            });
        });
    }

    async compile(mdl) {
        for (let task of this.loaders) {
            let code = mdl.code || void(0);
            let {loader, test, cmdOptions} = task;

            if (test.test(mdl.src)) {
                try {
                    let {compileTo, content, ...rest} = await loader.parse(mdl.src, code, cmdOptions, mdl);

                    // Todo: Multi loader with one string.
                    // resource transform is normal. ig. sass->css ts->js
                    mdl.compileTo = compileTo || path.extname(mdl.src).slice(1);
                    mdl.code = content;
                    mdl.restResource = rest;
                } catch (e) {
                    logger.errorNow(`Error `, e);
                }
            }
        }

        return mdl;
    }
}

const compilerLoader = new CompilerLoader(process.cwd());

export default compilerLoader;
