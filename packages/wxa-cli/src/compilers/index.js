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
import ComponentManager from '../resolvers/component';
import {readFile} from '../utils';

let debug = debugPKG('WXA:Compilers');

const jsOptions = {
    ast: true,
};

/**
 * default compiler
 *
 * @class EmptyCompiler
 */
export default class Compiler {
    constructor(resolve, meta) {
        this.current = meta.current;
        this.configs = {};
        this.resolve = resolve;
        this.meta = meta;
    }

    async parse(mdl) {
        debug('module to parse %O', mdl);

        let children = [];
        let content = mdl.code || readFile(mdl.src);
        let type = mdl.type || path.extname(mdl.meta.source);
        type = type.replace(/^\.*/, '');

        const options = {
            'js': jsOptions,
        };

        let {kind, ...rest} = await this.$parse(content, options[type], mdl.src, type, mdl);

        debug('kind %s, rest %o', kind, rest);
        // Todo: app.js or app.wxa will do compile twice.
        // drop template from app.wxa
        // if (mdl.category === 'app') delete code.template;

        // support not ever happened.
        // if (typeof ret === 'string') {
        //     mdl.code = ret;
        // }
        mdl.kind = kind;

        switch (kind) {
            case 'wxa': {
                mdl.rst = rest.wxa;
                // app.wxa do not have template to compile.
                if (mdl.category && mdl.category.toUpperCase() === 'APP') delete mdl.rst.template;

                children = children.concat(this.$$parseRST(mdl));
                break;
            }

            case 'xml': {
                mdl.xml = rest.xml;

                children = children.concat(this.$$parseXML(mdl));
                break;
            }

            case 'js': {
                // only allow babel-ast
                mdl.ast = rest.ast;

                children = children.concat(this.$$parseAST(mdl));
                break;
            }

            case 'css': {
                mdl.css = rest.css;

                children = children.concat(this.$$parseCSS(mdl));
                break;
            }

            case 'json': {
                mdl.json = rest.json;

                children = children.concat(this.$$parseJSON(mdl));
                break;
            }
        }

        return children;
    }

    $parse(code, configs={}, filepath, type, mdl) {
        switch (type) {
            case 'wxa': {
                mdl.isAbstract = true;
                return new WxaCompiler(this.resolve, this.meta).parse(filepath);
            }

            case 'js': {
                return new ScriptCompiler().parse(filepath, code, configs);
            }

            case 'css':
            case 'wxss': {
                return Promise.resolve({css: code, kind: 'css'});
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
                return Promise.resolve({kind: 'file'});
            }

            default: {
                // return Promise.reject(`未识别的文件类型%{type}, 请检查是否添加指定的loader`);
                return Promise.resolve({kind: 'other'});
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
        let deps = new ASTManager(this.resolve||{}, this.meta).parse(mdl);

        // analysis deps;
        return deps;
    }

    $$parseXML(mdl) {
        let deps = new XMLManager(this.resolve||{}, this.meta).parse(mdl);

        debug('xml dependencies %o', deps);
        // analysis deps;
        return deps;
    }

    $$parseCSS(mdl) {
        let deps = new CSSManager(this.resolve || {}, this.meta).parse(mdl);

        debug('css dependencies %o', deps);
        return deps;
    }

    $$parseJSON(mdl) {
        let category = mdl.category ? mdl.category.toLowerCase() : '';
        if (
            !~['app', 'component', 'page'].indexOf(category)
        ) {
            // normal json file or empty json file doesn't need to be resolved.
            return;
        }

        // Todo: global component
        // if (category === 'app') {}

        // Page or Component resolve
        return new ComponentManager(this.resolve, this.meta).parse(mdl);
    }
}
