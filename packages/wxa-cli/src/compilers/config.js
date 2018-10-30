import {readFile} from '../utils';
import logger from '../helpers/logger';
import debugPKG from 'debug';

let debug = debugPKG('WXA:ConfigCompiler');

export default class ConfigCompiler {
    parse(filepath, code) {
        if (code == null) code = readFile(filepath);

        if (code == null) {
            logger.error(`文件不存在, ${filepath}`);
            return Promise.reject(null);
        }
        // debug('code, %O', JSON.parse(code));

        return Promise.resolve({
            kind: 'json',
            json: JSON.parse(code),
        });
    }
}
