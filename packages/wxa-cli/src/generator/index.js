import path from 'path';
import ASTManager from '../ast';
import {writeFile, getDistPath, readFile} from '../utils';
import debugPKG from 'debug';
import DependencyResolver from '../helpers/dependencyResolver';

let debug = debugPKG('WXA:Generator');

export default class Generator {
    constructor(resolve, meta) {
        this.resolve = resolve;
        this.meta = meta;
    }

    do(mdl) {
        debug('module to generate %O', mdl);
        let outputPath;
        if (!mdl.meta || !mdl.meta.outputPath) {
            let dr = new DependencyResolver(this.resolve, this.meta);
            outputPath = dr.getOutputPath(mdl.src, mdl.pret, mdl);
        } else {
            outputPath = mdl.meta.outputPath;
        }

        if (mdl.type === 'js' || path.extname(mdl.src) === '.js') {
            debug('do generate %O', mdl);
            let {code, map} = new ASTManager(this.resolve, this.meta).generate(mdl);


            debug('output path %s', outputPath);
            writeFile(outputPath, code);
        } else if (mdl.type === 'wxml' || path.extname(mdl.src) === 'wxml') {
            writeFile(outputPath, mdl.xml.toString());
        } else if (mdl.isFile) {
            writeFile(outputPath, readFile(mdl.src));
        } else if (!mdl.isAbstract) {
            writeFile(outputPath, mdl.code);
        }
    }
}
