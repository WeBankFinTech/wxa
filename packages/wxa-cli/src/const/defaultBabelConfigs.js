import path from 'path';
import {existsSync} from 'fs';

// try to find @babel/runtime to decide whether add @babel/plugin-transform-runtime.
const cwd = process.cwd();
const babelRuntime = path.join(cwd, 'node_modules', '@babel/runtime/package.json');
let hasRuntime = existsSync(babelRuntime);

const defaultConfigs = {
    'cwd': path.join(__dirname, '../../'),
    'sourceMap': false,
    'presets': ['@babel/preset-env'],
    'plugins': [
        ['@babel/plugin-proposal-decorators', {'decoratorsBeforeExport': true}],
        ['@babel/plugin-proposal-class-properties'],
    ],
    'ignore': [
        'node_modules',
        'wxa-cli',
    ],
};

if (hasRuntime) {
    const pkg = require(babelRuntime);

    defaultConfigs.plugins.unshift(['@babel/plugin-transform-runtime', {'version': pkg.version || '7.2.0'}]);
}

export default defaultConfigs;
