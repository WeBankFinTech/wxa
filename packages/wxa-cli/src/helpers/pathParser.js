import path from 'path';
import logger from './logger';
import validUrl from 'valid-url';

export default class PathParser {
    constructor() {
        this.pkgReg = /^[^/]([\w\-\_\d@\.]*\/?)+$/;
    }

    parse(x) {
        if (typeof x !== 'string') throw new Error('path must be a string');

        let ret = {
            isRelative: false,
            isNodeModule: false,
            isAbsolute: false,
            isURI: false,
        };

        // judge path's kind;
        if (x[0] === '.') { // require('./') require('../')
            ret.isRelative = true;
        } else if (this.pkgReg.test(x)) { // require('@scope/pkg') require('pkg')
            ret.isNodeModule = true;
        } else if (path.isAbsolute(x)) { // require('/abcd')
            ret.isAbsolute = true;
        } else if (validUrl.is_uri(x)) {
            ret.isURI = true;
        } else {
            logger.error('Path Error', '无法解析的路径类型: '+x);
        }

        return ret;
    }
}
