// import path from 'path';
import Coder from '../../helpers/coder';
import DependencyResolver from '../../helpers/dependencyResolver';
import CSSManager from '../../compilers/style/styleResolver';
import debugPKG from 'debug';
import {logger, error} from '../../helpers/logger';
import {serializeXML} from '../../compilers/xml';

let debug = debugPKG('WXA:XMLManager');
let debugXMLStyle = debugPKG('WXA:XMLManager-style');
// const SOURCE_ATTR = ['src', 'href'];
// const STYLE_

class XMLManager {
    constructor(resolve, meta) {
        this.resolve = resolve;
        this.meta = meta;
    }

    parse(mdl) {
        if (mdl.xml == null) return null;

        let libs = [];

        mdl.xml.forEach((element) => {
            libs = libs.concat(this.walkXML(element, mdl));
        });

        mdl.code = new Coder().decodeTemplate( serializeXML(mdl.xml) );

        return libs;
    }

    walkXML(xml, mdl) {
        let libs = [];
        // ignore comment
        if (xml.type === 'comment') return libs;

        if (xml.type === 'tag') {
            libs = libs.concat(this.walkAttr(xml.attribs, mdl));
        }

        if (xml.children) {
            libs = libs.concat(Array.prototype.slice.call(xml.children).reduce((ret, child)=>{
                return ret.concat(this.walkXML(child, mdl));
            }, []));
        }

        return libs;
    }

    walkAttr(attributes, mdl) {
        let libs = [];
        debug('attributes walk %o', attributes);
        for (let name in attributes) {
            if (!attributes.hasOwnProperty(name)) continue;

            // let attr = attributes[name];
            // TODO optimize
            let attr = {
                nodeName: name,
                nodeValue: attributes[name],
            };

            // debug('attribute %O', attr);
            switch (attr.nodeName) {
                case 'src':
                case 'href': {
                    try {
                        let dr = new DependencyResolver(this.resolve, this.meta);

                        let {lib, source, pret} = dr.resolveDep(attr.nodeValue, mdl);
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

                        attr.nodeValue = resolved;
                    } catch (e) {
                        error('Resolve Error', {name: mdl.src, error: e, code: attr.nodeValue});
                    }

                    break;
                }

                case 'style': {
                    debugXMLStyle(attr.nodeName, attr.nodeType, attr.nodeValue, typeof attr.nodeValue);
                    if (!attr.nodeValue) break;
                    try {
                        let CM = new CSSManager(this.resolve, this.meta);
                        let {libs: subLibs, code} = CM.resolveStyle(attr.nodeValue, mdl);

                        // add parentNode to it.
                        subLibs = subLibs.map((lib)=>(lib.$$AttrNode=attr, lib));
                        // normalize dependencies.
                        libs = libs.concat(subLibs);

                        attr.nodeValue = code;
                    } catch (e) {
                        error('Resolve Error', {name: mdl.src, error: e, code: attr.nodeValue});
                    }

                    break;
                }

                default: {
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
