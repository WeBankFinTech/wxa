import path from 'path';
import logger from '../helpers/logger';
import DependencyResolver from '../helpers/dependencyResolver';
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
        if (typeof str !== 'string') return {libs, code: ''};

        let code = str.replace(
            /(?:\/\*[\s\S]*?\*\/|(?:[^\\:]|^)\/\/.*)|(\.)?url\(['"]?([\w\d_\-\.\/@]+)['"]?\)|@import\s+['"]?([\w\d_\-\.\/@]+)['"]?/igm,
            (match, point, dep, importCSS)=>{
                debug('style lib %s', dep);
                // a.require()
                if (point) return match;
                // ignore comment
                if (point == null && dep == null && importCSS == null) return match;

                dep = dep || importCSS;

                let resolved;
                try {
                    let dr = new DependencyResolver(this.resolve, this.meta);

                    let {lib, source, pret} = dr.resolveDep(dep, mdl);
                    let outputPath = dr.getOutputPath(source, pret, mdl);
                    resolved = dr.getResolved(lib, outputPath, mdl);

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
                } catch (e) {
                    resolved = dep;
                    logger.error(`解析失败 (${dep})`, e);
                }

                debug('libs %O', libs);

                return match.replace(dep, resolved);
            }
        );

        return {libs, code};
    }
}
