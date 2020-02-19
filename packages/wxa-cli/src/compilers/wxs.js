import debugPKG from 'debug';
import logger from '../helpers/logger';
import {readFile} from '../utils';
let parser = require('@babel/parser');
let debug = debugPKG('WXA:WxsCompiler');

// TODO: 没有保持内部状态的需求，组织成类有些多余
// 目前保留以遵守 ./index.js 中的规律
export default class WxsCompiler {
    parse(filepath, originCode, configs) {
        debug('WxsCompiler got %O %O', filepath, originCode);
        const code = ensureCode(originCode, filepath);
        const ast = tryParseCode(code, configs);

        return Promise.resolve({
            ast,
            kind: 'wxs',
        });
    }
}

function ensureCode(code, filepath) {
    if (code) {
        return code;
    } else {
        const codeFileContent = readFile(filepath);
        if (codeFileContent == null) logger.error(`文件不存在, ${filepath}`);
        return codeFileContent;
    }
}

function tryParseCode(code, configs) {
    try {
        return parseCode(code, configs);
    } catch (e) {
        logger.error('编译失败', e);
        return Promise.reject(e);
    }
}

function parseCode(code, configs) {
    return parser.parse(code, {
        sourceType: 'unambiguous',
        ...configs,
    });
}
