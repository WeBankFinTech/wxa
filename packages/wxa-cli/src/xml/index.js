import * as NODE from '../const/node';
import path from 'path';
import DependencyResolver from '../helpers/dependencyResolver';
import PathParser from '../helpers/pathParser';
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

        debug('libs in xml %O', libs);

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
                    let dr = new DependencyResolver(this.current, this.resolve, this.meta);

                    let meta = dr.resolveDep(attr.nodeValue, mdl);
                    let resolved = dr.getResolved(meta.lib, meta.source, meta.target, mdl);

                    libs.push({
                        absPath: meta.source,
                        pret: meta.pret,
                        $$meta: meta,
                        reference: {
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
                    libs = libs.concat(subLibs);
                }

                default: {
                }
            }
        }
        debug('attributes walk end libs %o', libs);
        return libs;
    }

    resolveStyle(str, mdl) {
        let libs = [];
        debug('style resolve start');
        str.replace(
            /(?:\/\*[\s\S]*?\*\/|(?:[^\\:]|^)\/\/.*)|(\.)?url\(['"]?([\w\d_\-\.\/@]+)['"]?\)/igm,
            (match, point, lib)=>{
                debug('style lib %s', lib);
                // a.require()
                if (point) return match;
                // ignore comment
                if (point == null && lib == null) return match;
                let dr = new DependencyResolver(this.resolve, this.meta);

                let {source, pret} = dr.resolveDep(lib, mdl);
                let outputPath = dr.getOutputPath(source, pret, mdl);
                let resolved = dr.getResolved(lib, source, outputPath, mdl);

                libs.push({
                    src: source,
                    pret: pret,
                    meta: {
                        source, outputPath,
                    },
                    reference: {
                        $$style: str,
                        $$match: match,
                        $$category: 'xml',
                    },
                });

                debug('libs %O', libs);

                return resolved;
            }
        );

        return libs;
    }
}

export {
    XMLManager as default,
};
