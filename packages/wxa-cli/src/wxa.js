import commander from 'commander';
import inquirer from 'inquirer';
import deepmerge from 'deepmerge';
import path from 'path';
import DefaultWxaConfigs from './const/defaultWxaConfigs';
import Builder from './builder';
import chalk from 'chalk';
// import {info, error, warn} from './utils';
import logger from './helpers/logger';
import Creator from './creator';
import Toolcli from './toolcli';
import {applyPlugins, getConfig, isFile} from './utils';

const version = require('../package.json').version;

let getWxaConfigs = ()=>{
    let custom = {};
    let configPath = path.join(process.cwd(), 'wxa.config.js');

    if (isFile(configPath)) {
        try {
            custom = getConfig();
        } catch (e) {
            // no custom wxa configs here.
            logger.error('Error', e);
            process.exit(0);
        }
    } else {
        logger.log('Configuration', '没有配置文件，正在使用默认配置');
    }

    let defaultWxaConfigs = new DefaultWxaConfigs(process.cwd());
    return deepmerge(defaultWxaConfigs.get(), custom, {arrayMerge: (destinationArray, sourceArray, options)=>sourceArray});
};

let wrapWxaConfigs = (fn)=>{
    return (wxaConfigs, instance, cmdOptions)=> {
        // overide third party options.
        let subWxaConfigs;
        if (instance) {
            instance.wxaConfigs = instance.wxaConfigs || {};
            instance.wxaConfigs.thirdParty = instance;
            subWxaConfigs = Object.assign({}, wxaConfigs, instance.wxaConfigs, {$name: instance.name});
        } else {
            subWxaConfigs = Object.assign({}, wxaConfigs);
        }

        return fn(subWxaConfigs, cmdOptions);
    };
};
commander
    .version(version, '-v, --version')
    .usage('[command] <options ...>');

commander
    .command('build')
    .description('编译项目')
    // .option('--verbose', '更加详细的log')
    .option('-w, --watch', '监听文件改动')
    .option('-N, --no-cache', '不使用缓存')
    .option('-m, --multi', '三方开发模式，一次编译出多个项目')
    .option('-p, --project <project>', '三方开发模式，单独指定需要编译监听的项目')
    .option('--no-progress', '不展示文件进度')
    // .option('--max-watch-project <max>', '三方开发模式，最多同时监听几个项目, default: 3')
    .action(async (cmd)=>{
        // console.log(cmd);
        logger.info('Hey', `This is ${chalk.keyword('orange')('wxa@'+version)}, Running in ${chalk.keyword('orange')(process.env.NODE_ENV || 'development')}`);
        let wxaConfigs = getWxaConfigs();
        // console.log(wxaConfigs);
        let newBuilder = wrapWxaConfigs((subWxaConfigs, cmdOptions)=>{
            let builder = new Builder(subWxaConfigs);
            applyPlugins(builder.wxaConfigs.plugins || [], builder);

            return builder.build(cmdOptions);
        });

        if (cmd.multi && wxaConfigs.thirdParty && wxaConfigs.thirdParty.length) {
            // third party development
            if (cmd.project) {
                cmd.project.split(',').forEach((project)=>{
                    // console.log(project);
                    // specify project to compile
                    project = wxaConfigs.thirdParty.find((instance)=>instance.name===project);

                    if (!project) {
                        logger.error('找不到指定的项目，请检查wxa.config.js中的三方配置');
                        process.exit(0);
                    } else {
                        newBuilder(wxaConfigs, project, cmd);
                    }
                });
            } else {
                // compile and watch all projects.
                wxaConfigs.thirdParty.forEach((instance)=>{
                    newBuilder(wxaConfigs, instance, {...cmd, watch: false});
                });
            }
        } else {
            // normal build.
            newBuilder(wxaConfigs, void(0), cmd);
        }
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
        ]);

        // console.log(opts);

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

