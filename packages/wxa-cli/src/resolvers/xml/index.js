// import path from 'path';
import Coder from '../../helpers/coder';
import DependencyResolver from '../../helpers/dependencyResolver';
import CSSManager from '../styleResolver';
import debugPKG from 'debug';
import {logger, error} from '../../helpers/logger';
import directive from '../../directive/index';
import {serializeXML} from '../../compilers/xml';

let debugXMLStyle = debugPKG('WXA:XMLManager-style');
// const SOURCE_ATTR = ['src', 'href'];
const WXA_DIRECTIVE_PREFIX = 'wxa';
const WECHAT_DIRECTIVE_PREFIX = 'wx';

class XMLManager {
    constructor(resolve, meta, scheduler) {
        this.$scheduler = scheduler;
        this.resolve = resolve;
        this.meta = meta;

        this.wxaConfigs = scheduler.wxaConfigs;
        this.cmdOptions = scheduler.cmdOptions;
    }

    parse(mdl) {
        if (mdl.xml == null) return null;

        let libs = [];
        // Node <-- Element
        // Node <-- Attr
        // Node <-- CharacterData <-- Text
        mdl.xml.forEach((node) => {
            libs = libs.concat(this.walkXML(node, mdl));
        });

        mdl.code = new Coder().decodeTemplate( serializeXML(mdl.xml) );

        return libs;
    }

    walkXML(node, mdl) {
        let libs = [];
        // ignore comment
        if (node.type === 'comment') return libs;

        if (node.type === 'tag') {
            // 此处的node即element
            libs = libs.concat(this.walkAttr(node.attribs, node, mdl));
        }

        if (node.children) {
            libs = libs.concat(Array.prototype.slice.call(node.children).reduce((ret, child)=>{
                return ret.concat(this.walkXML(child, mdl));
            }, []));
        }

        return libs;
    }

    walkAttr(attributes, element, mdl) {
        let libs = [];
        for (let attrFullName in attributes) {
            if (!attributes.hasOwnProperty(attrFullName)) continue;

            let attrFullNameTmp = (~attrFullName.indexOf(':')) ? attrFullName : ':'+attrFullName;
            let attrPrefixNameSplit = attrFullNameTmp.split(':');
            let prefix = attrPrefixNameSplit[0] || null;
            let name = attrPrefixNameSplit[1] || '';

            let attr = {
                raw: attrFullName,
                prefix,
                name,
                value: attributes[attrFullName],
            };

            if (attr.prefix) this.parseDirective(attr, element, mdl);
            else libs = libs.concat(this.findDeps(attr, element, mdl));
        }

        return libs;
    }

    findDeps(attr, ele, mdl) {
        let libs = [];
        // 无前缀普通属性
        switch (attr.name) {
            case 'src':
            case 'href':
                let dep = this.findLinkDeps(attr, mdl);
                if (dep) libs.push(dep);
                break;
            case 'style':
                let deps = this.findStyleDeps(attr, mdl);
                libs = libs.concat(deps);
        }

        return libs;
    }

    findLinkDeps(attr, mdl) {
        try {
            let dr = new DependencyResolver(this.resolve, this.meta);

            let {lib, source, pret} = dr.resolveDep(attr.value, mdl);
            let libOutputPath = dr.getOutputPath(source, pret, mdl);
            let resolved = dr.getResolved(lib, libOutputPath, mdl);

            attr.value = resolved;
            return {
                src: source,
                pret: pret,
                meta: {source, outputPath: libOutputPath},
                reference: {
                    $$AttrNode: attr,
                    $$category: 'xml',
                    resolved,
                },
            };
        } catch (e) {
            error('Resolve Error', {name: mdl.src, error: e, code: attr.value});
        }
    }

    findStyleDeps(attr, mdl) {
        debugXMLStyle(attr.name, attr.nodeType, attr.value, typeof attr.value);
        if (!attr.value) return [];
        let libs = [];
        try {
            let CM = new CSSManager(this.resolve, this.meta);
            let {libs: subLibs, code} = CM.resolveStyle(attr.value, mdl);

            // add parentNode to it.
            subLibs = subLibs.map((lib)=>(lib.$$AttrNode=attr, lib));
            // normalize dependencies.
            libs = libs.concat(subLibs);

            attr.value = code;
        } catch (e) {
            error('Resolve Error', {name: mdl.src, error: e, code: attr.value});
        }

        return libs;
    }

    parseDirective(attr, element, mdl) {
        // 带前缀的属性处理
        switch (attr.prefix) {
            // wxa指令
            case WXA_DIRECTIVE_PREFIX: {
                let drc = {
                    raw: attr.raw,
                    name: attr.name,
                    value: attr.value,
                };
                directive(drc, element, {
                    mdl,
                    cmdOptions: this.cmdOptions,
                    wxaConfigs: this.wxaConfigs,
                    addDirective: (name) => {
                        debugger;
                        this.$scheduler.directiveBroker.emit('add', name);
                    },
                    removeDirective: (name) => {
                        this.$scheduler.directiveBroker.emit('remove', name);
                    },
                });
            }
            // 微信小程序指令
            case WECHAT_DIRECTIVE_PREFIX: {

            }
        }
    }
}

export {
    XMLManager as default,
};
