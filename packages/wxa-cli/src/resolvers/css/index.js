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
        debug('parse start %O', mdl);

        if (mdl.css == null) return [];

        let {libs: deps, code} = this.resolveStyle(mdl.css, mdl);

        mdl.code = code;
        return deps;
    }

    resolveStyle(str, mdl) {
        let libs = [];
        debug('style resolve start');
        let code = str.replace(
            /(?:\/\*[\s\S]*?\*\/|(?:[^\\:]|^)\/\/.*)|(\.)?url\(['"]?([\w\d_\-\.\/@]+)['"]?\)/igm,
            (match, point, dep)=>{
                debug('style lib %s', lib);
                // a.require()
                if (point) return match;
                // ignore comment
                if (point == null && dep == null) return match;
                let dr = new DependencyResolver(this.resolve, this.meta);

                let {lib, source, pret} = dr.resolveDep(dep, mdl);
                let outputPath = dr.getOutputPath(source, pret, mdl);
                let resolved = dr.getResolved(lib, outputPath, mdl);

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

        return {libs, code};
    }
}
