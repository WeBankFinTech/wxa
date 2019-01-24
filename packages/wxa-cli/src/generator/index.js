import path from 'path';
import {writeFile, getDistPath, readFile, copy} from '../utils';
import debugPKG from 'debug';
import DependencyResolver from '../helpers/dependencyResolver';
import ProgressBar from '../helpers/progressTextBar';

let debug = debugPKG('WXA:Generator');

export default class Generator {
    constructor(cwd, meta, configs, cmdOptions) {
        this.cwd = cwd;
        this.resolve = configs.resolve;
        this.meta = meta;
        this.wxaConfigs = configs;
        this.cmdOptions = cmdOptions;

        this.progress = new ProgressBar(cwd, configs);
    }

    do(mdl) {
        if (mdl.isAbstract) return;

        const text = path.relative(this.cwd, mdl.src);
        this.progress.draw(text, 'Generating', !this.cmdOptions.verbose);

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
        mdl.meta.accOutputPath = outputPath;

        if (mdl.isFile) {
            copy(mdl.src, outputPath);
        } else {
            writeFile(outputPath, mdl.code);
        }
    }

    tryTransFormExtension(output) {
        if (this.wxaConfigs.target === 'wxa') {
            // 小程序相关
            let opath = path.parse(output);

            let ext;
            switch (opath.ext) {
                case '.css': ext = '.wxss'; break;
                case '.xml': ext = '.wxml'; break;
                case '.ts': ext = '.js'; break;
                default: ext = opath.ext;
            }

            return opath.dir + path.sep + opath.name + ext;
        }
    }
}
