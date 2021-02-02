import path from 'path';
import logger from './logger';
import validUrl from 'valid-url';

export default class PathParser {
    constructor(resolveConfigs = {}) {
        this.pkgReg = /^[@\w\_\-\d\.]+(\/[\w\-\_\d@\.]+)*$/;
        this.base64Reg = /^data:[\w\/;,+]/;
        this.dynamicReg = /{{[^{}]*}}/;

        if (resolveConfigs.exclude) {
            let exclude = Array.isArray(resolveConfigs.exclude) ? resolveConfigs.exclude : [resolveConfigs.exclude];

            let excludeRegArr = exclude.map((item) => {
                return typeof item === 'string' ? new RegExp(item, 'g') : item
            });

            this.isExcludeFile = (pathString) => {
                return excludeRegArr.some((reg) => reg.test(pathString))
            }
        } else {
            this.isExcludeFile = () => false;
        }
    }

    parse(x) {
        if (typeof x !== 'string') throw new Error('path must be a string');

        let ret = {
            isExcludeFile: false,
            isRelative: false,
            isNodeModule: false,
            isAPPAbsolute: false,
            isURI: false,
            isPlugin: false,
            isWXALib: false,
            isDynamic: false,
            isBase64: false,
        };

        // judge path's kind;
        // dynamic string is highest priority.
        if (this.isExcludeFile(x)) {
            ret.isExcludeFile = true;
        } if (this.dynamicReg.test(x)) {
            ret.isURI = true;
            ret.isDynamic = true;
        } else if (x[0] === '.') { // require('./') require('../')
            ret.isRelative = true;
        } else if (this.pkgReg.test(x)) { // require('@scope/pkg') require('pkg')
            ret.isNodeModule = true;
        } else if (x[0] === '/') { // require('/abcd')
            ret.isAPPAbsolute = true;
        } else if (this.base64Reg.test(x)) {
            ret.isURI = true;
            ret.isBase64 = true;
        } else if (validUrl.is_uri(x)) { // components from plugin or uri
            if (x.indexOf('plugin://') === 0) ret.isPlugin = true;
            else if (x.indexOf('wxa://') === 0) (ret.isWXALib = true, ret.name = x.slice(6));
            else ret.isURI = true;
        } else {
            throw new Error('Path Error', '无法解析的路径类型: '+x);
        }

        return ret;
    }
}

export function isIgnoreFile(mdl) {
    let ignoreFileType = ['isExcludeFile', 'isURI', 'isPlugin', 'isBase64', 'isDynamic'];

    return ignoreFileType.some((item) => mdl[item]);
}
