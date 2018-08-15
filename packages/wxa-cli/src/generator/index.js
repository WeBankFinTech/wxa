import path from 'path';
import ASTManager from '../ast';
import {writeFile, getDistPath} from '../utils';
import debugPKG from 'debug';
import DependencyResolver from '../helpers/dependencyResolver';

let debug = debugPKG('WXA:Generator');

export default class Generator {
    constructor(resolve, meta) {
        this.resolve = resolve;
        this.meta = meta;
    }

    do(mdl) {
        if (mdl.type === 'js' || path.extname(mdl.src) === '.js') {
            debug('do generate %O', mdl);
            let {code, map} = new ASTManager(this.resolve, this.meta).generate(mdl);

            let outputPath;
            if (!mdl.meta || !mdl.meta.outputPath) {
                let dr = new DependencyResolver(this.resolve, this.meta);
                outputPath = dr.getOutputPath(mdl.src, mdl.pret, mdl);
            } else {
                outputPath = mdl.meta.outputPath;
            }

            debug('output path %s', outputPath);
            writeFile(outputPath, code);
        }
    }
}
