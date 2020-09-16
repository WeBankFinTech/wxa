import path from 'path';
import {existsSync} from 'fs';

// try to find @babel/runtime to decide whether add @babel/plugin-transform-runtime.
const cwd = process.cwd();
const babelRuntime = path.join(cwd, 'node_modules', '@babel/runtime/package.json');
let hasRuntime = existsSync(babelRuntime);

const commonConfigs = {
    'plugins': [
        ['@babel/plugin-proposal-decorators', {'decoratorsBeforeExport': true}],
        ['@babel/plugin-proposal-class-properties'],
    ],
    'presets': ['@babel/preset-env'],

}
if (hasRuntime) {
    const pkg = require(babelRuntime);

    commonConfigs.plugins.unshift(['@babel/plugin-transform-runtime', {'version': pkg.version || '7.2.0'}]);
}

const defaultConfigs = {
    'cwd': path.join(__dirname, '../../'),
    'sourceMap': false,
    overrides: [{
        exclude: [/node_modules/,  /wxa-cli/],
        ...commonConfigs
    }
    ,{
        test: /wxa-e2eTest/,
        ...commonConfigs
    }

]
};


export default defaultConfigs;
