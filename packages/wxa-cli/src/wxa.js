import commander, {Option} from 'commander';
import {spawnBuilder} from './builder';
import chalk from 'chalk';
import Creator from './creator';
import convert from './convert';
import {getConfigs} from './getConfigs';
import {WXA_PROJECT_NAME} from './const/wxaConfigs';
import {isEmpty} from './utils';
import {toolHandler} from './toolcli';

const version = require('../package.json').version;

let showSlogan = () => {
    console.info(`🖖 Hi, @wxa version ${chalk.keyword('orange')(''+version)} present`);
};

let processProjectsOptions = (configs, cmdOptions) => {
    let projects = cmdOptions.project;

    if (isEmpty(projects)) {
        projects = configs[0].name !== WXA_PROJECT_NAME ? configs[0].name : WXA_PROJECT_NAME;
    }

    if (projects === '*') projects = configs.reduce((p, i) => (p+','+i.name), '');

    projects = projects.split(',');
    projects = projects.filter((p)=>!isEmpty(p));

    cmdOptions.project = projects;

    return;
};

commander
    .version(version, '-v, --version')
    .usage('[command] <options ...>');

commander
    .command('build')
    .description('编译项目')
    .option('--configs-path <configsPath>', 'wxa.configs.js文件路径，默认项目根目录')
    .option('-w, --watch', '监听文件改动')
    .option('-N, --no-cache', '不使用缓存')
    .option('--source-map', '生成sourceMap并输出')
    .option('-p, --project <project>', '指定需要编译的项目，默认是default， * 表示编译所有项目')
    .option('--no-progress', '不展示文件进度')
    .option('--verbose', '展示多余的信息')
    .option('-t, --target', '编译目标平台，如微信小程序wechat, 头条小程序tt')
    .option('--mock', '是否编译wxa:mock指令')
    .action((cmd)=>{
        showSlogan();
        console.info(`🤖 Building with ${chalk.keyword('orange')(process.env.NODE_ENV || 'development')} env` );
        let configs = getConfigs(cmd.configsPath);
        processProjectsOptions(configs, cmd);

        spawnBuilder(configs, cmd);
    });

commander
    .command('create')
    .description('新建模板')
    .option('--repo <repo>', '仓库地址，可选github或gitee，允许传自定义的repo地址，网速考虑，默认gitee', 'gitee')
    .option('--project-name <projectName>', '项目名')
    .action( (cmd)=>{
        showSlogan();
        console.info('🦊 Creating 新建项目中');

        new Creator(cmd).run();
    });

const cliCmdConfigs =[
    'login', 'preview', 'autoPreview', 'open', 'close', 'quit', 'resetFileUtils', {
        name: 'upload',
        options: [
            ['--upload-version [version]', '上传时的版本号'],
            ['-d, --desc [desc]', '上传时的备注'],
        ],
    }, {
        name: 'auto',
        options: [
            ['--auto-port [port]', '自动化监听端口'],
            ['--auto-account [openid]', '自动化openid'],
        ],
    }, {
        name: 'buildNpm',
        options: [
            ['--compile-type [compileType]', '指定编译类型', undefined, ['miniprogram', 'plugin']],
        ],
    }, {
        name: 'cache',
        options: [
            ['--clean <clean>', '清除的缓存类型', undefined, ['storage', 'file', 'compile', 'auth', 'network', 'session', 'all']],
        ],
    },
]; 
const cliCloudCmdConfigs = [
    'envList', {
        name: 'funcList',
        options: [['--env [env]', '云环境id']],
    }, {
        name: 'funcInfo',
        options: [['--env [env]', '云环境id'], ['--names [name...]', '云函数名']],
    }, {
        name: 'deploy',
        options: [['--env [env]', '云环境id'], ['--names [name...]', '云函数名称,如果使用不要提供appid或ext-appid'], ['--paths [paths...]', '需要部署的云函数目录路径'], ['--remote-npm-install', '云端安装依赖，指定选项后 node_modules 将不会上传']],
    }, {
        name: 'incDeploy',
        options: [['--env [env]', '云环境id'], ['--name [name]', '云函数名称，不能跟paths一起使用'], ['--path [path]', '需要部署的云函数目录路径，不能跟name一起使用'], ['--file [file]', '需要增量更新的相对文件/目录路径，路径必须是相对云函数目录的路径']],
    }, {
        name: 'download',
        options: [['--env [env]', '云环境id'], ['--name [name]', '云函数名'], ['--path [path]', '下载后存放的位置']],
    },
];
function optionBuilder(flag, desc, default_, choice) {
    let o = new Option(flag, desc);
    if (default_ != undefined) {
        o.default(default_);
    }
    if (choice) {
        o.choices(choice);
    }
    return o;
}
function processConfigs(configs, projects) {
    if (projects[0] === '*') {
        return configs;
    };
    return projects.map((p)=>configs.find((conf)=>conf.name === p)).filter((v)=>v);
};
function getAllOpt(cmd) {
    let cur = cmd;
    let opts = {};
    while (cur) {
        opts = {...opts, ...cur.opts()};
        cur = cur.parent;
    }
    return opts;
}
function buildCommandWithConfig(base, config) {
    config.forEach((conf)=>{
        let name = typeof conf === 'string'? conf:conf.name;
        let cmd = base.command(name);
        (conf.options||[]).forEach((o)=>{
            cmd.addOption(optionBuilder(...o));
        });
        cmd.action((options, inst)=>{
            let option = getAllOpt(inst);
            showSlogan();
            let configs = processConfigs(getConfigs(option.configsPath), option.project);
            if (!configs) {
                console.error(`没有找到项目`);
            }
            configs.forEach((c)=>{
                option.project = c.output.path;
                toolHandler(c, name, option);
            });
        });
    });
}
let cliCmd = commander.command('cli')
    .description('微信开发者工具命令行调用')
    .option('--configs-path <configsPath>', 'wxa.configs.js文件路径，默认当前目录')
    .option('-p, --project <project...>', '三方开发模式，单独指定操作的项目', [WXA_PROJECT_NAME]);

buildCommandWithConfig( cliCmd, cliCmdConfigs);

let cliCloudCmd = cliCmd.command('cloud')
    .description('微信开发者工具云开发操作')
    .option('--appid, [appid]', 'appid')
    .option('--ext-appid, [extAppid]', '第三方appid');

buildCommandWithConfig(cliCloudCmd, cliCloudCmdConfigs);

commander
    .command('convert')
    .description('原生小程序代码转 wxa')
    .option('-i, --input <input>', '原生小程序代码路径')
    .option('-o, --output <output>', '输出路径')
    .action((cmd)=>{
        showSlogan();
        console.info('🦊 Converting 转换中');

        convert(cmd);
    });

commander.parse(process.argv);

