import path from 'path';

export default function resolveAlias(lib, alias, filepath) {
    if (alias == null) return lib;

    let opath = path.parse(filepath);

    Object.keys(alias).forEach((key)=>{
        let value = alias[key];
        let aliasReg = new RegExp(`(^${key}$)|(^${key}\/.*$)`, 'gm');
        if (aliasReg.test(lib)) {
            let tar = lib.replace(new RegExp(key, 'g'), value);
            let otar = path.parse(tar);
            // calc relative path base cwd;
            tar = path.join(path.relative(tar, opath.dir), otar.base);
            lib = tar.split(path.sep).join('/').replace(/^\.\.\//, './');
        }
    });

    return lib;
}
