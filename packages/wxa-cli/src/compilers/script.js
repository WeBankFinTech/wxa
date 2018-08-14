import path from 'path';
import {readFile} from '../utils';
import logger from '../helpers/logger';
import debugPKG from 'debug';
let parser = require('@babel/parser');

let debug = debugPKG('WXA:ScriptCompiler');

export default class scriptCompiler {
    parse(filepath, code, configs) {
        if (code == null) code = readFile(filepath);

        if (code == null) logger.errorNow(`文件不存在, ${filepath}`);

        let ast;
        try {
            ast = parser.parse(code, {
                plugins: [
                    ['decorators', {decoratorsBeforeExport: true}],
                    'classProperties',
                ],
                sourceType: 'unambiguous',
                ...configs,
            });
        } catch (e) {
            logger.errorNow('编译失败', e);
            return Promise.reject(e);
        }

        // debug('AST generate %O', ast);

        return Promise.resolve({
            ast,
        });
    }
}
