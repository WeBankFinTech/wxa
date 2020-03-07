// import path from 'path';
import Coder from '../../helpers/coder';
import DependencyResolver from '../../helpers/dependencyResolver';
import CSSManager from '../../compilers/style/styleResolver';
import debugPKG from 'debug';
import {logger, error} from '../../helpers/logger';
import directive from '../directive';
import {serializeXML} from '../../compilers/xml';

let debug = debugPKG('WXA:XMLManager');
let debugXMLStyle = debugPKG('WXA:XMLManager-style');
// const SOURCE_ATTR = ['src', 'href'];
// const STYLE_
const WXA_DIRECTIVE_PREFIX = 'wxa';
const WECHAT_DIRECTIVE_PREFIX = 'wx';

class XMLManager {
    constructor(resolve, meta) {
        this.resolve = resolve;
        this.meta = meta;
    }

    parse(mdl) {
        if (mdl.xml == null) return null;

        let libs = [];

        // mdl.xml.forEach((element) => {
        //     libs = libs.concat(this.walkXML(element, mdl));
        // });

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
        // debug('attributes walk %o', attributes);
        for (let attrFullName in attributes) {
            if (!attributes.hasOwnProperty(attrFullName)) continue;

            let attrFullNameTmp = (~attrFullName.indexOf(':')) ? attrFullName : ':'+attrFullName;
            let attrPrefixNameSplit = attrFullNameTmp.split(':');
            let prefix = attrPrefixNameSplit[0] || null;
            let name = attrPrefixNameSplit[1] || '';

            let attr = {
                prefix,
                name,
                value: attributes[attrFullName],
            };
            // debug('attribute %O', attr);
            if (!attr.prefix) {
                // 无前缀普通属性
                switch (attr.name) {
                    case 'src':
                    case 'href': {
                        try {
                            let dr = new DependencyResolver(this.resolve, this.meta);

                            let {lib, source, pret} = dr.resolveDep(attr.value, mdl);
                            let libOutputPath = dr.getOutputPath(source, pret, mdl);
                            let resolved = dr.getResolved(lib, libOutputPath, mdl);

                            libs.push({
                                src: source,
                                pret: pret,
                                meta: {source, outputPath: libOutputPath},
                                reference: {
                                    $$AttrNode: attr,
                                    $$category: 'xml',
                                    resolved,
                                },
                            });

                            attr.value = resolved;
                        } catch (e) {
                            error('Resolve Error', {name: mdl.src, error: e, code: attr.value});
                        }

                        break;
                    }

                    case 'style': {
                        debugXMLStyle(attr.name, attr.nodeType, attr.value, typeof attr.value);
                        if (!attr.value) break;
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

                        break;
                    }

                    default: {
                        // 其他属性不处理
                    }
                }
            } else {
                // 带前缀的属性处理
                switch (attr.prefix) {
                    // wxa指令
                    case WXA_DIRECTIVE_PREFIX: {
                        let drc = {
                            name: attr.name,
                            value: attr.value,
                        };
                        directive(drc, element, mdl);
                    }

                    // 微信小程序指令
                    case WECHAT_DIRECTIVE_PREFIX: {

                    }

                    default: {
                        // 其他前缀属性不处理
                    }
                }
            }
        }
        debug('attributes walk end libs %o', libs);
        return libs;
    }
}

export {
    XMLManager as default,
};
