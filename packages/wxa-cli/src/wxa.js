import commander from 'commander';
import inquirer from 'inquirer';
import deepmerge from 'deepmerge';
import path from 'path';
import DefaultWxaConfigs from './const/defaultWxaConfigs';
import Builder from './builder';
import Tester from './tester/index';
import https from 'https';
import {spawnBuilder} from './builder';
import chalk from 'chalk';
import Creator from './creator';
import {spawnDevToolCli} from './toolcli';
import {getConfigs} from './getConfigs';
import {WXA_PROJECT_NAME} from './const/wxaConfigs';
import {isEmpty} from './utils';

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
.action(async (cmd)=>{
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
.action(async (cmd)=>{
    showSlogan();
    console.info('🦊 Creating 新建项目中');

    new Creator(cmd).run();
});

commander
.command('cli')
.description('微信开发者工具命令行调用')
.option('--configs-path <configsPath>', 'wxa.configs.js文件路径，默认项目根目录')
.option('-a, --action <action>', '指定操作, open, login, preview, upload')
.option('-p, --project <project>', '三方开发模式，单独指定操作的项目')
.action(async (cmd)=>{
    showSlogan();
    console.info('🐌 目前仅支持调用微信开发者工具指令');
    let configs = getConfigs(cmd.configsPath);
    processProjectsOptions(configs, cmd);

    spawnDevToolCli(configs, cmd);
});

commander
.command('test')
.description('测试模式')
.option('-e, --e2e', 'e2e测试模式')
.option('-p, --port', '监听端口')
.option('-o, --out-dir [outDir]', '测试用例输出文件夹', '__wxa_e2e_test__')
.option('--cli-path [cliPath]', '微信开发者工具路径')
.action((cmd)=>{
    logger.info('Hey', `This is ${chalk.keyword('orange')('wxa@'+version)}, Running in ${chalk.keyword('orange')(process.env.NODE_ENV || 'development')}, Tester Mode`);
    let wxaConfigs = getWxaConfigs();

    new Tester(cmd, wxaConfigs).build();
});

commander
.command('create')
.description('新建模板')
.action(async (cmd)=>{
    logger.info('Hey', `This is ${chalk.keyword('orange')('wxa@'+version)}, Running in ${chalk.keyword('orange')(process.env.NODE_ENV || 'development')}`);
    logger.info('Creating', '新建项目中😋');

    let opts = await inquirer.prompt([
        {
            type: 'input',
            name: 'projectName',
            message: '输入项目名',
            validate: (input)=>{
                return !(input == null || input === '');
            },
        },
        {
            type: 'list',
            name: 'template',
            message: '选择模板',
            default: 'base',
            choices: [
                {
                    name: '基础模板，默认配置文件',
                    value: 'base',
                },
                {
                    name: 'Redux模板，使用redux管理全局状态',
                    value: 'redux',
                },
                {
                    name: 'Vant模板, 使用有赞ui加速小程序开发',
                    value: 'vant',
                },
                {
                    name: 'Echart模板, 使用echart开发小程序图表',
                    value: 'echart',
                },
            ],
        },
        {
            type: 'input',
            name: 'appid',
            message: '小程序APPID',
            default: '',
        },
    ]);

    new Creator(cmd).run(opts);
});

commander
.command('cli')
.description('微信开发者工具命令行调用')
.option('-a, --action <action>', '指定操作, open, login, preview, upload')
.option('-m, --multi', '三方开发模式，一次操作多个项目')
.option('-p, --project <project>', '三方开发模式，单独指定操作的项目')
.action(async (cmd)=>{
    let wxaConfigs = getWxaConfigs();

    let newCli = wrapWxaConfigs((subWxaConfigs, cmd)=>{
        let cli = new Toolcli(subWxaConfigs);
        cli.run(cmd);
    });

    let question = async ()=>await inquirer.prompt([
        {
            type: 'input',
            name: 'version',
            message: '小程序版本号',
            default: require(path.join(process.cwd(), 'package.json')).version || '1.0.0',
        },
        {
            type: 'input',
            name: 'desc',
            message: '版本描述',
            default: '版本描述',
        },
    ]);

    if (
        cmd.multi &&
        wxaConfigs.thirdParty &&
        wxaConfigs.thirdParty.length &&
        cmd.action === 'upload'
    ) {
        let options = await question();
        cmd.options = options;
        // third party development
        if (cmd.project) {
            cmd.project.split(',').forEach((project)=>{
                // specify project to compile
                project = wxaConfigs.thirdParty.find((instance)=>instance.name===project);

                if (!project) {
                    logger.error('找不到指定的项目，请检查wxa.config.js中的三方配置');
                    process.exit(0);
                } else {
                    newCli(wxaConfigs, project, cmd);
                }
            });
        } else {
            // compile and watch all projects.
            wxaConfigs.thirdParty.forEach((project)=>{
                newCli(wxaConfigs, project, {...cmd});
            });
        }
    } else {
        if (cmd.action === 'upload') cmd.options = await question();
        // normal build.
        newCli(wxaConfigs, void(0), cmd);
    }
});

commander.parse(process.argv);

