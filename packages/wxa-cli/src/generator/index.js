import path from 'path';
import ASTManager from '../resolvers/ast/index';
import {writeFile, getDistPath, readFile} from '../utils';
import debugPKG from 'debug';
import DependencyResolver from '../helpers/dependencyResolver';

let debug = debugPKG('WXA:Generator');

export default class Generator {
    constructor(resolve, meta, configs) {
        this.resolve = resolve;
        this.meta = meta;
        this.configs = configs;
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

        outputPath = this.tryTransFormExtension(outputPath);
        debug('transform ext %s', outputPath);

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

    tryTransFormExtension(output) {
        if (this.configs.target === 'wxa') {
            // 小程序相关
            let opath = path.parse(output);

            let ext;
            switch (opath.ext) {
                case '.css': ext = '.wxss'; break;
                case '.xml': ext = '.wxml'; break;
                default: ext = opath.ext;
            }

            return opath.dir + path.sep + opath.name + ext;
        }
    }
}
