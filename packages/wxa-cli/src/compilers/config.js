import {readFile} from '../utils';
import logger from '../helpers/logger';

export default class ConfigCompiler {
    parse(filepath, code) {
        if (code == null) code = readFile(filepath);

        if (code == null) {
            logger.errorNow(`文件不存在, ${filepath}`);
            return Promise.reject();
        }

        return Promise.resolve({config: JSON.parse(code)});
    }
}
