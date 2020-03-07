import path from 'path';
import {isFile, isEmpty} from './utils';
import logger from './helpers/logger';
import DefaultWxaConfigs, {WXA_PROJECT_NAME} from './const/wxaConfigs';
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
    let doDeepMerge = (a, b)=>deepmerge(a, b, {arrayMerge: (destinationArray, sourceArray, options)=>sourceArray});

    if (isFile(wxaConfigsPath)) {
        configs = require(wxaConfigsPath);

        // 支持配置文件返回函数
        if (typeof configs === 'function') configs = configs();
        // 支持返回数组
        if (Array.isArray(configs)) configs = configs.map((item)=>doDeepMerge(defaultWxaConfigs, item));
        else configs = doDeepMerge(defaultWxaConfigs, configs);
    } else {
        logger.info('Configuration', '没有配置文件，正在使用默认配置');
        configs = doDeepMerge(defaultWxaConfigs, {});
    }

    return configs;
}

const DEFAULT_NAME = WXA_PROJECT_NAME;
function spawnConfigs(configs) {
    if (Array.isArray(configs)) {
        // every config item means make one project.
        configs[0].name = configs[0].name || DEFAULT_NAME;

        configs = configs.map((item)=>(item.name=item.name, item));

        return configs;
    }

    // fallback for wxa2.1
    if (!configs.thirdParty) {
        configs.name = configs.name || DEFAULT_NAME;

        return [configs];
    }
    let platform = configs.thirdParty || [];
    delete configs.thirdParty;

    let platformConfigs = platform.map((item) => {
        return {...configs, ...item};
    });

    platformConfigs.unshift({...configs, name: configs.name || DEFAULT_NAME});

    return platformConfigs;
}

export function getConfigs(wxaConfigsPath) {
    let configs = loadConfigs(wxaConfigsPath);

    return spawnConfigs(configs);
}
