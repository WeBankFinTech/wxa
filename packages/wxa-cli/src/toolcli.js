import path from 'path';
import fs from 'fs';
import {exec} from 'child_process';
import logger from './helpers/logger';
import debugPKG from 'debug';
const debug = debugPKG('WXA:Toolcli');

const Commands = {
    'login': {},
    'preview': {options: ['project']},
    'autoPreview': {cmd: 'auto-preview', options: ['project']},
    'upload': {options: ['project', 'version', 'desc']},
    'npm': {options: ['project', 'compile-type']},
    'auto': {options: ['project', ['autoPort', 'auto-port'], ['autoAccount', 'auto-account']]},
    'open': {options: ['project']},
    'close': {options: ['project']},
    'resetFileUtils': {cmd: 'reset-fileutils', options: ['project']},
    'buildNpm': {cmd: 'build-npm', options: ['project']},
    'cache': {options: ['project', 'clean']},
    'envList': {options: ['project', 'appid', ['extAppid', 'ext-appid']]},
    'funcInfo': {options: ['project', 'appid', ['extAppid', 'ext-appid'], 'env', 'names']},
    'deploy': {options: ['project', 'appid', ['extAppid,ext-appid'], 'env', 'names', 'paths', ['remoteNpmInstall', 'remote-npm-install']]},
    'incDeploy': {options: ['project', 'appid', ['extAppid', 'ext-appid'], 'path', 'file']},
    'download': {options: ['project', 'appid', ['extAppid', 'ext-appid'], 'name', 'path']},
};

export function toolHandler(config, name, options) {
    let cli = getCliPath(config.wechatwebdevtools);
    processOptions(options);
    let cmd = buildCmd(cli, name, options);
    debug('start cli %O', cmd);
    execute(cmd);
}
function getCliPath(root) {
    let toolPath;
    let appPath = root;
    if (process.platform == 'win32') {
        if (!appPath) {
            throw new Error('未找到开发者工具');
        }
        toolPath = path.join(appPath, 'cli.bat');
    } else if (process.platform == 'darwin') {
        toolPath = path.join(
            appPath || '/Applications/wechatwebdevtools.app',
            '/Contents/MacOS/cli'
        );
    } else {
        throw new Error('微信开发者工具不支持的系统类型');
    }
    if (!fs.existsSync(toolPath)) {
        throw new Error('未找到开发者工具');
    }
    return `"${toolPath}"`;
}
function execute(command) {
    debug('command to execute %s', command);
    let cp = exec(command, (err, stdout, stderr) => {
        logger.error(err);
        console.log(stdout);
        console.error(stderr);
    });
    cp.stdout.on('data', (msg) => {
        console.log(msg);
    });
    cp.stderr.on('data', (err) => {
        console.error(err);
    });
    cp.on('close', (code) => {
        console.log(code);
    });
}
function getName(name) {
    return Commands[name].cmd?Commands[name].cmd:name;
}
function buildOptions(arr) {
    return arr
        .filter((v) => v.length==2 && v[1]!==undefined)
        .map((v)=>{
            if (typeof v[1] == 'boolean') {
                return `--${v[0]}`;
            }
            return `--${v[0]} ${v[1]}`;
            })
        .join(' ');
}
function buildCmd(cli, name, options) {
    return `${cli} ${getName(name)} ${buildOptions(mappingOptions(name, options))}`;
}
function mappingOptions(name, options) {
    let mapping = Commands[name].options||[];
    return mapping.map((m)=>
        typeof m == 'string'
        ?[m, options[m]]
        :[m[1], options[m[0]]]
    );
}
function removeIfExist(base, a, b) {
    if (base[b]) delete base[a];
}
function processOptions(options) {
    removeIfExist(options, 'project', 'extAppid');
    removeIfExist(options, 'project', 'appid');
    Object.keys(options).forEach((k)=>{
        if (Array.isArray( options[k])) options[k] = options[k].join(' ');
    });
}
