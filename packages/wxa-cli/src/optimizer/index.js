import path from 'path';
import ASTManager from '../ast';
import debugPKG from 'debug';

let debug = debugPKG('WXA:Optimizer');

export default class Optimizer {
    constructor(resolve, meta) {
        debug('optimizer constructor, %o %o ', resolve, meta);
        this.meta = meta;
        this.resolve = resolve;
    }

    do(indexOfModule) {
        debug('start');

        indexOfModule.forEach((mdl)=>{
            if (mdl.type && mdl.type === 'wxa') return;

            if (mdl.type === 'js' || path.extname(mdl.src) === '.js') {
                debug('js mdl %O', mdl);
                new ASTManager(this.resolve, this.meta).optimize(mdl);
            }
        });
    }
}
