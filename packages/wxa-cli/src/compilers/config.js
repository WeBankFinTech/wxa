import {readFile} from '../utils';
import logger from '../helpers/logger';
import json5 from 'json5';

export default class ConfigCompiler {
    parse(filepath, code) {
        if (code == null) code = readFile(filepath);

        if (code == null) {
            logger.error(`文件不存在, ${filepath}`);
            return Promise.reject(null);
        }

        let jsonData = json5.parse(code);

        return Promise.resolve({
            kind: 'json',
            json: jsonData,
        });
    }
}
