import * as NODE from '../../const/node';
import path from 'path';
import DependencyResolver from '../../helpers/dependencyResolver';
import CSSManager from '../css/index';
import debugPKG from 'debug';

let debug = debugPKG('WXA:XMLManager');

// const SOURCE_ATTR = ['src', 'href'];
// const STYLE_

class XMLManager {
    constructor(resolve, meta) {
        this.resolve = resolve;
        this.meta = meta;
    }

    parse(mdl) {
        if (mdl.xml == null) return null;

        let libs = this.walkXML(mdl.xml, mdl);

        debug('libs in xml %O %O', mdl.xml, libs);

        mdl.code = mdl.xml.toString();
        return libs;
    }

    walkXML(xml, mdl) {
        debug('walk xml start %s', xml.nodeType);
        let libs = [];
        // ignore comment
        if (xml.nodeType === NODE.COMMENT_NODE) return libs;

        if (xml.nodeType === NODE.ELEMENT_NODE) {
            // element p view
            debug('xml %O', xml);
            libs = libs.concat(this.walkAttr(xml.attributes, mdl));
        }

        if (xml.childNodes) {
            libs = libs.concat(Array.prototype.slice.call(xml.childNodes).reduce((ret, child)=>{
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

            let attr = attributes[name];

            debug('attribute %O', attr);
            switch (attr.nodeName) {
                case 'src':
                case 'href': {
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

                    break;
                }

                case 'style': {
                    let CM = new CSSManager(this.resolve, this.meta);
                    let {libs: subLibs, code} = CM.resolveStyle(attr.nodeValue, mdl);

                    // add parentNode to it.
                    subLibs = subLibs.map((lib)=>(lib.$$AttrNode=attr, lib));
                    // normalize dependencies.
                    libs = libs.concat(subLibs);

                    attr.nodeValue = code;

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
