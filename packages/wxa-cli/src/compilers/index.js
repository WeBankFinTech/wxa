import WxaCompiler from './wxa';
import ScriptCompiler from './script';
import XmlCompiler from './xml';
import ConfigCompiler from './config';
import ASTManager from '../resolvers/ast/index';
import XMLManager from '../resolvers/xml/index';
import CSSManager from '../resolvers/css/index';
import defaultPret from '../const/defaultPret';
import debugPKG from 'debug';
import path from 'path';

let debug = debugPKG('WXA:Compilers');

const jsOptions = {
    ast: true,
};

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

    async parse(mdl) {
        let children = [];
        let code = mdl.code || void(0);
        let type = mdl.sourceType || mdl.compileTo || path.extname(mdl.src);
        type = type.replace(/^\.*/, '');

        const options = {
            'js': jsOptions,
        };

        let ret = await this.$parse(code, options[type], mdl.src, type, mdl);

        // Todo: app.js or app.wxa will do compile twice.
        // drop template from app.wxa
        if (ret.rst && mdl.category === 'app') delete ret.rst.template;

        if (typeof ret === 'string') {
            mdl.code = ret;
        }

        if (ret.rst) {
            mdl.rst = ret.rst;
            // app.wxa do not have template to compile.
            if (mdl.category && mdl.category.toUpperCase() === 'APP') delete mdl.rst.template;

            children.push(this.$$parseRST(mdl));
        }

        if (ret.xml) {
            mdl.xml = ret.xml;

            children.push(this.$$parseXML(mdl));
        }

        if (ret.ast) {
            // only allow babel-ast
            mdl.ast = ret.ast;

            children.push(this.$$parseAST(mdl));
        }

        if (ret.config) mdl.config = ret.config;

        return children;
    }

    $parse(code, configs={}, filepath, type, mdl) {
        switch (type) {
            case 'wxa': {
                mdl.isAbstract = true;
                return new WxaCompiler().parse(filepath);
            }

            case 'js': {
                return new ScriptCompiler().parse(filepath, code, configs);
            }

            case 'css':
            case 'wxss': {
                return new CSSCompiler().parse(filepath, code, configs);
            }

            case 'wxml': {
                return new XmlCompiler().parse(filepath, code);
            }

            case 'json':
            case 'config': {
                return new ConfigCompiler().parse(filepath, code);
            }

            case 'png':
            case 'jpg':
            case 'jpeg':
            case 'webp':
            case 'eot':
            case 'woff':
            case 'woff2':
            case 'ttf':
            case 'file': {
                // just copy.
                mdl.isFile = true;
                return Promise.resolve();
            }

            default: {
                return Promise.reject(`未识别的文件类型%{type}, 请检查是否添加指定的loader`);
            }
        }
    }

    $$parseRST(mdl) {
        // spread mdl with child nodes
        return Object.keys(mdl.rst).map((key)=>{
            let dep = Object.assign({}, mdl.rst[key]);
            // wxa file pret object should as same as his parent node.
            dep.pret = mdl.pret || defaultPret;
            dep.category = mdl.category || '';
            dep.pagePath = mdl.pagePath || void(0);
            return dep;
        });
    }

    $$parseAST(mdl) {
        let deps = new ASTManager(this.wxaConfigs.resolve||{}, this.meta).parse(mdl);

        // analysis deps;
        return deps;
    }

    $$parseXML(mdl) {
        let deps = new XMLManager(this.wxaConfigs.resolve||{}, this.meta).parse(mdl);

        debug('xml dependencies %o', deps);
        // analysis deps;
        return deps;
    }
}

export default new Compiler();
