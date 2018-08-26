import path from 'path';
import DependencyResolver from '../../helpers/dependencyResolver';
import debugPKG from 'debug';

let debug = debugPKG('WXA:CSSManager');

export default class CSSManager {
    constructor(resolve, meta) {
        this.resolve = resolve;
        this.meta = meta;
    }

    parse(mdl) {
        debug('parse start');

        if (mdl.css == null) return [];

        return CSSManager.resolveStyle(mdl.css, mdl);
    }

    static resolveStyle(str, mdl) {
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
