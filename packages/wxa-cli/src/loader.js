import path from 'path';
import findNpmModule from './helpers/findNpmModule';
import logger from './helpers/logger';
import {NpmManager} from './helpers/npmManager';
import defaultBabelConfigs from './const/defaultBabelConfigs';
import debugPKG from 'debug';

let debug = debugPKG('WXA:Loader');

class CompilerLoader {
    constructor(wxaConfigs, cwd) {
        this.current = cwd;
        this.wxaConfigs = wxaConfigs;

        this.modulePath = path.join(this.current, 'node_modules');

        this.cliModulePath = path.join(__dirname, '../node_modules');
        // all loader in queue.
        this.loaders = [];

        this.npmManager = new NpmManager(wxaConfigs.dependencyManager);
    }

    /**
     *
     * try load loader from
     * - absoulte path,
     * - project's npm repos,
     * - @wxa/cli's npm repos.
     *
     * @param {Array<Object>} useLoaders loader to load
     * @param {Object} cmdOptions options from terminal.
     * @return {Promise}
     */
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
                let isDone = false;
                let err;

                // try to find loader from project's node_modules
                try {
                    let main = findNpmModule(compilerName, this.modulePath);
                    Loader = require(main).default;

                    isDone = true;
                } catch (e) {
                    err = e;
                }

                // try to find loader from cli's node_modules;
                if (!isDone) {
                    try {
                        let main = findNpmModule(compilerName, this.cliModulePath);

                        Loader = require(main).default;
                        isDone = true;
                    } catch (e) {
                        debug('load cli\'s loader fail %O', e);
                    }
                }

                // still no find, then use npm manager try to install it.
                if (!isDone) {
                    console.error(err);
                    logger.error('未安装的编译器：'+compilerName);
                    logger.info('Install', `尝试安装${compilerName}中`);

                    return this.npmManager.install(compilerName).then((succ)=>{
                        logger.info('Success', `安装${compilerName}成功`);

                        try {
                            let main = findNpmModule(compilerName, this.modulePath);
                            Loader = require(main).default;
                        } catch (e) {
                            logger.error('找不到编译器，请手动安装依赖！');
                            process.exit(0);
                        }

                        return {Loader, uri, loader, cmdOptions};
                    }, (fail)=>{
                        logger.error(`安装编译器 ${compilerName} 失败，请尝试手动安装依赖(npm i -D ${compilerName})`, fail);
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
                    const defaultConfigs = /babel/.test(uri) ? defaultBabelConfigs : {};

                    let options = loader.options || defaultConfigs;
                    let instance = new Loader(this.current, options);
                    // console.log(instance);
                    let test = loader.test || instance.test;

                    if (test == null) throw new Error('wxa.config.js配置有误，请指定use.loader.test', JSON.stringify(loader));

                    this.loaders.push({
                        test, loader: instance, options, cmdOptions,
                    });
                } catch (e) {
                    debug('挂载compiler %s 失败原因：%O', uri, e);
                    logger.error(`挂载compiler ${uri} 错误, 请检查依赖是否有正确安装`, e);
                }
            });
        });
    }

    promiseSerial(funs) {
        return funs.reduce((promise, fun)=>{
            return promise.then((result)=>fun().then(Array.prototype.concat.bind(result)));
        }, Promise.resolve([]));
    }

    async compile(mdl, compilation) {
        let tasks = [];

        let fn = async (task, mdl)=>{
            let {loader, test, cmdOptions} = task;


            if (test.test(mdl.src)) {
                debug('loader is working %O, dep %O', loader, mdl);
                try {
                    let {code, ...rest} = await loader.parse(mdl, cmdOptions, compilation);

                    // Todo: Multi loader with one string
                    mdl.code = code;
                    mdl.sourceMap = rest.sourceMap;
                    mdl.restResource = rest;
                } catch (e) {
                    debug('parse Error %O', e);
                    throw e;
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

// const compilerLoader = new CompilerLoader(process.cwd());

export default CompilerLoader;
