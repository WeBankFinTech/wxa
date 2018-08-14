import ASTManager from '../ast';
import {writeFile} from '../utils';
import debugPKG from 'debug';

let debug = debugPKG('WXA:Generator');

export default class Generator {
    constructor(resolve, meta) {
        this.resolve = resolve;
        this.meta = meta;
    }

    do(mdl) {
        if (mdl.type === 'js') {
            debug('do generate %O', mdl);
            let {code, map} = new ASTManager(this.resolve, this.meta).generate(mdl);

            // debug('generate code %s', code);
            writeFile(mdl.$$meta.target, code);
        }
    }
}
