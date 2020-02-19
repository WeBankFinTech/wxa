import path from 'path';
import logger from './logger';
import validUrl from 'valid-url';

export default class PathParser {
    constructor() {
        this.pkgReg = /^[@\w\_\-\d\.]+(\/[\w\-\_\d@\.]+)*$/;
        this.base64Reg = /^data:[\w\/;,+]/;
        this.dynamicReg = /{{[^{}]*}}/;
    }

    parse(x) {
        if (typeof x !== 'string') throw new Error('path must be a string');

        let ret = {
            isRelative: false,
            isNodeModule: false,
            isAbsolute: false,
            isURI: false,
            isPlugin: false,
            isWXALib: false,
            isDynamic: false,
            isBase64: false,
        };

        // judge path's kind;
        // dynamic string is highest priority.
        if (this.dynamicReg.test(x)) {
            ret.isURI = true;
            ret.isDynamic = true;
        } else if (x[0] === '.') { // require('./') require('../')
            ret.isRelative = true;
        } else if (x[0] === '#') { // require('#') require plugin plugin require('plugin name')
            ret.isPlugin = true;
        } else if (this.pkgReg.test(x)) { // require('@scope/pkg') require('pkg')
            ret.isNodeModule = true;
        } else if (x[0] === '/') { // require('/abcd')
            ret.isAPPAbsolute = true;
        } else if (validUrl.is_uri(x)) { // components from plugin or uri
            if (x.indexOf('plugin://') === 0) ret.isPlugin = true;
            else if (x.indexOf('wxa://') === 0) (ret.isWXALib = true, ret.name = x.slice(6));
            else ret.isURI = true;
        } else if (this.base64Reg.test(x)) {
            ret.isURI = true;
            ret.isBase64 = true;
        } else {
            throw new Error('Path Error', '无法解析的路径类型: '+x);
        }

        return ret;
    }
}
