import DependencyResolver from '../../helpers/dependencyResolver';
import PathParser from '../../helpers/pathParser';
import logger from '../../helpers/logger';
import {isFile} from '../../utils';
import debugPKG from 'debug';

let debug = debugPKG('WXA:ComponentManager');

export default class ComponentManager {
    constructor(resolve, meta, appConfigs) {
        this.resolve = resolve;
        this.meta = meta;
        this.appConfigs = appConfigs;

        this.extensions = ['.wxml', '.wxss', '.js', '.json'];
    }

    parse(mdl) {
        debug('module to parse %O', mdl);

        if (mdl.json == null) return [];

        // merge global components from app.json
        if (mdl.category && mdl.category.toLowerCase() === 'page') {
            debug('merge global component and page components %O', mdl);
            mdl.json.usingComponents = {
                ...this.appConfigs.usingComponents,
                ...mdl.json.usingComponents,
            };
        }

        if (mdl.json.usingComponents == null) return [];

        debug('coms %O', Object.keys(mdl.json.usingComponents));
        if (
            Object.keys(mdl.json.usingComponents).length === 0
        ) {
            return [];
        }

        let childNodes = this.resolveComponents(mdl.json.usingComponents, mdl);

        debug('component childNodes %O', childNodes);

        return childNodes;
    }

    resolveComponents(coms, mdl) {
        return Object.keys(coms).reduce((ret, alias)=>{
            let com = coms[alias];
            let dr = new DependencyResolver(this.resolve, this.meta);

            try {
                let {lib, source, pret} = dr.$resolve(com, mdl);
                let outputPath = dr.getOutputPath(source, pret, mdl);
                let resolved = dr.getResolved(lib, outputPath, mdl);

                if (pret.isPlugin || pret.isURI) return ret;

                // check if wxa file.
                if (isFile(source+this.meta.wxaExt)) {
                    ret.push({
                        src: source+this.meta.wxaExt,
                        category: 'Component',
                        pret,
                        meta: {
                            source: source+this.meta.wxaExt,
                        },
                        type: 'wxa',
                    });
                } else {
                    this.extensions.forEach((ext)=>{
                        let src = source+ext;
                        if (isFile(src)) {
                            ret.push({
                                src,
                                pret,
                                category: 'Component',
                                meta: {
                                    source: src, outputPath: outputPath+ext,
                                },
                            });
                        } else if (ext === '.json') {
                            logger.warn(alias+'组件不存在json配置文件');
                        }
                    });
                }

                coms[alias] = resolved;
                return ret;
            } catch (e) {
                logger.warn(e);
                debug(e);
                return ret;
            }
        }, []);
    }

    findComponentSource(com, mdl) {
    }
}
