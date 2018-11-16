import path from 'path';

export default function resolveAlias(lib, alias, filepath) {
    if (alias == null) return lib;

    let opath = path.parse(filepath);

    Object.keys(alias).forEach((key)=>{
        let value = alias[key];
        let aliasReg = new RegExp(`(^${key}$)|(^${key}\/.*$)`, 'gm');
        if (aliasReg.test(lib)) {
            // logger.info('find alias', lib);
            let tar = lib.replace(new RegExp(key, 'g'), value);
            // logger.info('parsed lib', tar);
            // calc relative path base cwd;
            tar = path.relative(opath.dir, tar);
            lib = './'+tar
                    .replace(/\\/g, '/');
        }
    });

    return lib;
}
