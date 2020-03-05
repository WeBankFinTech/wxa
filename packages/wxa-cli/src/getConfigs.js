import path from 'path';
import {isFile} from './utils';
import logger from './helpers/logger';
import DefaultWxaConfigs from './const/defaultWxaConfigs';
import deepmerge from 'deepmerge';

/**
 *  加载配置
 * @param {String} wxaConfigsPath
 *
 * @return {Object}
 */
function loadConfigs(wxaConfigsPath) {
    let current = process.cwd();
    wxaConfigsPath = wxaConfigsPath || path.join(current, 'wxa.config.js');

    let defaultWxaConfigs = new DefaultWxaConfigs(current).get();

    let configs = {};
    if (isFile(wxaConfigsPath)) {
        configs = require(wxaConfigsPath);
    } else {
        logger.info('Configuration', '没有配置文件，正在使用默认配置');
    }

    configs = deepmerge(defaultWxaConfigs, configs, {arrayMerge: (destinationArray, sourceArray, options)=>sourceArray});

    return configs;
}


function spawnConfigs(configs) {
    if (!configs.thirdParty && !configs.dispense) return [configs];

    let platform = configs.thirdParty || configs.dispense || [];

    delete configs.thirdParty;
    delete configs.dispense;

    let platformConfigs = platform.map((item) => {
        return {...configs, ...item, $name: item.name};
    });

    platformConfigs.unshift({...configs, $name: 'default'});

    return platformConfigs;
}

export function getConfigs(wxaConfigsPath) {
    let configs = loadConfigs(wxaConfigsPath);

    return spawnConfigs(configs);
}
