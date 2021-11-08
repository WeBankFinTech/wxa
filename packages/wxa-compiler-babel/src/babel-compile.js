import {transform, transformFile} from '@babel/core';
import fs from 'fs';

module.exports = function({type, source, options, ...args}, callback) {
    let map = new Map([['transform', transform], ['transformFile', transformFile]]);

    // debug('arguments %O', args)
    let i = Date.now();
    map.get(type).call(null, source, options, function(err, result) {
        fs.writeFile(process.cwd()+'/babel.compiler.log', JSON.stringify([
            options.filename, Date.now() - i,
        ], void 0, 2), {flag: 'a'}, ()=>{});

        if(err) callback(err);

        callback(null, result);
    });
}
