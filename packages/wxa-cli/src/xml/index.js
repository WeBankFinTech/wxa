import * as NODE from '../const/node';
import path from 'path';
import DependencyResolver from '../helpers/dependencyResolver';
import PathParser from '../helpers/pathParser';

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

        return libs;
    }

    walkXML(xml, mdl) {
        let libs = [];
        // ignore comment
        if (xml.nodeType === NODE.COMMENT_NODE) return libs;

        if (xml.nodeType === NODE.ELEMENT_NODE) {
            // element p view
            libs = libs.concat(this.walkAttr(xml.attributes, mdl));
        } else if (xml.childNodes && xml.childNodes.length) {
            libs = libs.concat(Array.prototype.slice.call(xml.childNodes).reduce((ret, child)=>{
                return ret.concat(this.walkXML(child, mdl));
            }, []));
        } else {
            return libs;
        }
    }

    walkAttr(attributes, mdl) {
        let libs = [];
        for (let attr of attributes) {
            switch (attr.nodeName) {
                case 'src':
                case 'href': {
                    let dr = new DependencyResolver(this.current, this.resolve, this.meta);

                    let meta = dr.resolveDep(attr.nodeValue, mdl);
                    let resolved = dr.getResolved(meta.lib, meta.source, meta.target, mdl);

                    libs.push({
                        absPath: meta.source,
                        pret: meta.pret,
                        $$meta: meta,
                        from: {
                            $$AttrNode: attr,
                            $$category: 'xml',
                            resolved,
                        },
                    });
                }

                case 'style': {
                    let subLibs = this.resolveStyle(attr.nodeValue, mdl);

                    // add parentNode to it.
                    subLibs = subLibs.map((lib)=>(lib.$$AttrNode=attr, lib));
                    // normalize dependencies.
                    libs.concat(subLibs);
                }

                default: {
                }
            }
        }
    }

    resolveStyle(str, mdl) {
        let libs = [];

        str.replace(
            /(?:\/\*[\s\S]*?\*\/|(?:[^\\:]|^)\/\/.*)|(\.)?url\(['"]?([\w\d_\-\.\/@]+)['"]?\)/igm,
            (match, point, lib)=>{
                // a.require()
                if (point) return match;
                // ignore comment
                if (point == null && lib == null) return match;

                let dr = new DependencyResolver(this.current, this.resolve, this.meta);

                let meta = dr.resolveDep(lib, mdl);

                libs.push({
                    src: meta.source,
                    pret: meta.pret,
                    $$meta: meta,
                    from: {
                        $$style: str,
                        $$match: match,
                        $$category: 'xml',
                    },
                });

                return match;
            }
        );

        return libs;
    }
}

export {
    XMLManager as default,
};
