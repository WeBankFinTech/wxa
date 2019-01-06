import path from 'path';
import findRoot from 'find-root';
import {readFile, isFile} from '../utils';

export function getPkgJson(modulesPath, lib) {
    let uri = path.join(modulesPath, lib);
    let location = findRoot(uri);
    let content = readFile(path.join(location, 'package.json'));
    try {
        content = JSON.parse(content);
    } catch (e) {
        content = null;
    }

    return content;
}

export default function(name, modulePath) {
    // 非指定文件的node_modules路径依赖
    let pkg = getPkgJson(modulePath, name);
    if (!pkg) {
        throw new Error('找不到模块'+name);
    }
    let main = pkg.main || 'index.js';
    if (pkg.browser && typeof pkg.browser === 'string') {
        main = pkg.browser;
    }
    if (isFile(path.join(modulePath, name, main))) {
        return path.join(modulePath, name, main);
    } else {
        throw new Error('找不到文件 '+name);
    }
}
