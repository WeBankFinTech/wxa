import path from 'path';
import PathParser from './pathParser';

export default function resolveAlias(lib, alias, filepath) {
    if (alias == null) return lib;

    let opath = path.parse(filepath);

    let pathParser = new PathParser();

    Object.keys(alias).forEach((key)=>{
        let value = alias[key];
        let aliasReg = new RegExp(`(^${key}$)|(^${key}\/.*$)`, 'gm');
        if (aliasReg.test(lib)) {
            // logger.info('find alias', lib);
            let tar = lib.replace(new RegExp(key, 'g'), value);
            tar = path.normalize(tar);
            let calcRel = () => {
                tar = path.relative(opath.dir, tar);
                lib = './'+tar.replace(/\\/g, '/');
            };
            // logger.info('parsed lib', tar);
            // calc relative path base cwd;
            if (path.isAbsolute(tar)) {
                calcRel();
            } else {
                lib = tar;
            }
        }
    });

    return lib;
}
