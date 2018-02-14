import path from 'path';
import {error} from './utils';
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
        if (this.map[type] == null) throw new Error('不存在的编译器');
        return this.map[type];
    }
    mount(usedCompilers, configs) {
        usedCompilers.forEach((uri)=>{
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
                    error('未安装的编译器：'+compilerName);
                    throw e;
                }
            }
            new Compiler(this.current, configs).mount(this.map);
        });
    }
}

const compilerLoader = new CompilerLoader(process.cwd());
compilerLoader.mount([EmptyCompiler], {});

export default compilerLoader;
