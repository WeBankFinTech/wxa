import BabelCompiler from './babel-compiler';
import SassCompiler from './sass-compiler';

class CompilerLoader {
    constructor() {
        this.map = {
            js: BabelCompiler,
            babel: BabelCompiler,
            sass: SassCompiler,
            scss: SassCompiler,
        };
    }
    get(type) {
        if (this.map[type] == null) throw new Error('不存在的编译器');
        return this.map[type];
    }
}

export default CompilerLoader;
