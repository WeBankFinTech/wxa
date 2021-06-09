let fs = require('fs');
let path = require('path');
let mkdirp = require('mkdirp');

function readFile(p) {
    let rst = '';
    p = typeof p === 'object' ? path.join(p.dir, p.base) : p;
    try {
        rst = fs.readFileSync(p, 'utf-8');
    } catch (e) {
        rst = null;
    }

    return rst;
}

function writeFile(p, data) {
    let opath = typeof p === 'string' ? path.parse(p) : p;
    mkdirp.sync(opath.dir);
    fs.writeFileSync(p, data);
}

module.exports={
    readFile,
    writeFile,
};
