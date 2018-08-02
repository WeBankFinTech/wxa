import {DOMParser} from 'xmldom';
import Coder from '../helpers/coder';
import logger from '../helpers/logger';
import path from 'path';
import {readFile} from '../utils';


export default class XmlCompiler {
    parse(filepath, code) {
        if (code == null) code = readFile(filepath);

        if (code == null) {
            logger.errorNow(`文件不存在, ${filepath}`);
            return Promise.reject();
        }

        return Promise.resolve(this.resolveXml(filepath, code));
    }

    resolveXml(filepath, code) {
        let coder = new Coder();

        code = coder.encodeTemplate(code, 0, code.length);

        let xml = this.parseXml(path.parse(filepath)).parseFromString(code);

        code = Array.prototype.slice.call(xml.childNotes||[]).reduce((ret, node)=>{
            ret += coder.decodeTemplate(node.toString());
            return ret;
        }, '');

        return {
            xml, code,
        };
    }

    parseXml(opath) {
        return new DOMParser({
            errorHandler: {
                warn(x) {
                    logger.errorNow('XML警告:'+(opath.dir+path.sep+opath.base));
                    logger.warnNow(x);
                },
                error(x) {
                    logger.errorNow('XML错误:'+(opath.dir+path.sep+opath.base));
                    logger.errorNow(x);
                },
            },
        });
    }
}
