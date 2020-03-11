import {
    Parser,
    DomHandler,
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
            xml = parseXML(code, path.parse(filepath));
        } else {
            xml = {};
        }

        code = Array.prototype.slice.call(xml||[]).reduce((ret, node)=>{
            ret += coder.decodeTemplate(domSerializer(node, {xmlMode: true}));
            return ret;
        }, '');

        debug('decoded template %s', code);

        return {
            xml, code,
        };
    }
}

export function parseXML(code, opath) {
    let handler = new DomHandler((err, dom)=>{
        if (err) {
            logger.error('XML错误:'+(opath.dir+path.sep+opath.base));
            logger.error(err);
        }
    }, {
        // normalizeWhitespace: true,   //default:false
    });

    let htmlStr = code;
    new Parser(handler, {
        xmlMode: false, // forgiving html parser
        recognizeSelfClosing: true,
        lowerCaseTags: false, // needn't make tag lower case
        lowerCaseAttributeNames: false,
        recognizeCDATA: true,
    }).end(htmlStr);

    let dom = handler.dom;
    return dom;
}

export function serializeXML(xml) {
    return domSerializer(xml, {xmlMode: true});
}
