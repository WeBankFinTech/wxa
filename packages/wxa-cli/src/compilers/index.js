import WxaCompiler from './compilers/wxa';
import ScriptCompiler from './compilers/script';
import XmlCompiler from './compilers/xml';
import ConfigCompiler from './compilers/config';
import debugPKG from 'debug';

let debug = debugPKG('WXA:Compilers');
/**
 * default compiler
 *
 * @class EmptyCompiler
 */
class Compiler {
    constructor(cwd) {
        this.current = cwd;
        this.configs = {};
    }
    parse(code, configs, filepath, type) {
        type = type.replace(/^\.*/, '');
        switch (type) {
            case 'wxa': {
                return new WxaCompiler().parse(filepath);
            }

            case 'js': {
                return new ScriptCompiler().parse(filepath, code, {});
            }

            case 'wxml': {
                return new XmlCompiler().parse(filepath, code);
            }

            case 'json':
            case 'config': {
                return new ConfigCompiler().parse(filepath, code);
            }

            default: {
                return Promise.resolve(code);
            }
        }
    }
}

export default new Compiler();
