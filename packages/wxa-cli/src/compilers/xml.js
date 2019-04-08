// import {DOMParser} from 'xmldom';
import {
    Parser,
    DomHandler
} from 'htmlparser2';
import domSerializer from 'dom-serializer';
import Coder from '../helpers/coder';
import logger from '../helpers/logger';
import path from 'path';
import {readFile} from '../utils';
import debugPKG from 'debug';

let debug = debugPKG('WXA:XmlCompiler');

// NOTE htmlparser2
// Parser           : walk through the dom tree and expose a variety of hooks
// DomHandler:      : use Parser's hooks to construct an AST object
// domSerializer    : serialize the AST object to html string

export default class XmlCompiler {
    parse(filepath, code) {
        if (code == null) code = readFile(filepath);

        if (code == null) {
            logger.error(`文件不存在, ${filepath}`);
            return Promise.reject();
        }

        return Promise.resolve({
            ...this.resolveXml(filepath, code),
            kind: 'xml',
        });
    }

    resolveXml(filepath, code) {
        debug('encode filepath %s', filepath);
        let coder = new Coder();

        code = coder.encodeTemplate(code, 0, code.length);

        debug('encoded template %s', code);
        let xml;
        if (code !== '') {
            // xml = this.parseXml(path.parse(filepath)).parseFromString(code);
            // xml = this.parseXml(path.parse(filepath))
            xml = this.parseXml(code)
        } else {
            xml = {};
        }


        code = Array.prototype.slice.call(xml.childNodes||[]).reduce((ret, node)=>{
            ret += coder.decodeTemplate(node.toString());
            return ret;
        }, '');

        debug('decoded template %s', code);


        // debugger;
        return {
            xml, code,
        };
    }

    parseXml(code) {
        // return new DOMParser({
        //     errorHandler: {
        //         warn(x) {
        //             logger.warn('XML警告:'+(opath.dir+path.sep+opath.base));
        //             logger.warn(x);
        //         },
        //         error(x) {
        //             logger.error('XML错误:'+(opath.dir+path.sep+opath.base));
        //             logger.error(x);
        //         },
        //     },
        // });
        let handler = new DomHandler({
            // normalizeWhitespace: true,   //default:false
            onerror(err) {
                logger.error('XML错误:'+(opath.dir+path.sep+opath.base));
                logger.error(x);
            }
        });
        let htmlStr = code;
        let parser = new Parser(handler).end(htmlStr);
        let dom = handler.dom;
        // debugger;
        
        return dom;
    }
}
