import path from 'path';
import logger from './helpers/logger';
import npmManager from './helpers/npmManager';

/**
 * default compiler
 *
 * @class EmptyCompiler
 */
class EmptyCompiler {
    constructor(cwd) {
        if (EmptyCompiler.prototype.instance) return EmptyCompiler.prototype.instance;
        EmptyCompiler.prototype.instance = this;

        this.current = cwd;
        this.configs = {};
    }
    parse(content, configs, filepath) {
        return Promise.resolve(content);
    }
    mount(map) {
        map['wxml'] = this;
        map['css'] = this;
        map['js'] = this;
        return map;
    }
}

class CompilerLoader {
    constructor(cwd) {
        this.map = {};
        this.current = cwd;
        this.modulePath = path.join(this.current, 'node_modules');
    }
    get(type) {
        if (this.map[type] == null) {
            logger.errorNow(`未知的编译器类型: ${type}, 请尝试安装对应的编译器（@wxa/compiler-${type}?）后并添加到wxa.config.js文件配置后，重新构建`);
            process.exit(0);
        }

        return this.map[type];
    }
    mount(usedCompilers, configs) {
        let coms = usedCompilers.map((uri)=>{
            let Compiler;
            if (typeof uri === 'function') {
                Compiler = uri;
            } else if (uri.indexOf('/') === 0) {
                // 绝对路径
                Compiler = require(uri).default;
            } else {
                let compilerName = '@wxa/compiler-'+uri;
                try {
                    Compiler = require(path.join(this.modulePath, compilerName)).default;
                } catch (e) {
                    logger.errorNow('未安装的编译器：'+compilerName);
                    logger.infoNow('Install', `尝试安装${compilerName}`);
                    return npmManager.install(compilerName).then((succ)=>{
                        logger.infoNow('Success', `安装${compilerName}成功`);

                        try {
                            Compiler = require(path.join(this.modulePath, compilerName)).default;
                        } catch (e) {
                            logger.errorNow('找不到编译器，请手动安装依赖！');
                            process.exit(0);
                        }

                        return {Compiler, uri};
                    }, (fail)=>{
                        logger.errorNow(`安装编译器 ${compilerName} 失败，请尝试手动安装依赖(npm i -D ${compilerName})`, fail);
                    });
                }
            }
            return Promise.resolve({Compiler, uri});
        });

        return Promise.all(coms)
        .then((succ)=>{
            succ.forEach(({Compiler, uri})=>{
                try {
                    new Compiler(this.current, configs).mount(this.map);
                } catch (e) {
                    logger.errorNow(`挂载compiler ${uri} 错误, 请检查依赖是否有正确安装`);
                }
            });
        });
    }
}

const compilerLoader = new CompilerLoader(process.cwd());
compilerLoader.mount([EmptyCompiler], {});

export default compilerLoader;
