import commander from 'commander';
import inquirer from 'inquirer';
import {spawnBuilder} from './builder';
import chalk from 'chalk';
import Creator from './creator';
import {spawnDevToolCli} from './toolcli';
import {getConfigs} from './getConfigs';

const version = require('../package.json').version;

let showSlogan = () => {
    console.info(`🖖 Hi, @wxa version ${chalk.keyword('orange')(''+version)} present`);
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
    .option('-m, --multi', '三方开发模式，一次编译出多个项目')
    .option('-p, --project <project>', '三方开发模式，单独指定需要编译监听的项目')
    .option('--no-progress', '不展示文件进度')
    .option('--verbose', '展示多余的信息')
    .option('-t, --target', '编译目标平台，如微信小程序wechat, 头条小程序tt')
    .action(async (cmd)=>{
        showSlogan();
        console.info(`🤖 Building with ${chalk.keyword('orange')(process.env.NODE_ENV || 'development')} env` );
        let configs = getConfigs(cmd.configsPath);
        spawnBuilder(configs, cmd);
    });

commander
    .command('create')
    .description('新建模板')
    .action(async (cmd)=>{
        showSlogan();
        console.info('🦊 Creating 新建项目中');

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
    .option('--configs-path <configsPath>', 'wxa.configs.js文件路径，默认项目根目录')
    .option('-a, --action <action>', '指定操作, open, login, preview, upload')
    .option('-m, --multi', '三方开发模式，一次操作多个项目')
    .option('-p, --project <project>', '三方开发模式，单独指定操作的项目')
    .action(async (cmd)=>{
        let configs = getConfigs(cmd.configsPath);
        spawnDevToolCli(configs, cmd);
    });

commander.parse(process.argv);

