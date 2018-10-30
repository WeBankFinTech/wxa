import commander from 'commander';
import deepmerge from 'deepmerge';
import DefaultWxaConfigs from './const/defaultWxaConfigs';
import Builder from './builder';
import chalk from 'chalk';
// import {info, error, warn} from './utils';
import logger from './helpers/logger';
import Creator from './creator';
import Toolcli from './toolcli';
import {applyPlugins, getConfig} from './utils';

const version = require('../package.json').version;

let getWxaConfigs = ()=>{
    let custom = {};

    try {
        custom = getConfig();
    } catch (e) {
        // no custom wxa configs here.
    }

    let defaultWxaConfigs = new DefaultWxaConfigs(process.cwd());
    return deepmerge(defaultWxaConfigs.get(), custom, {arrayMerge: (destinationArray, sourceArray, options)=>sourceArray});
};

commander
    .version(version, '-v, --version')
    .usage('[command] <options ...>');

commander
    .command('build')
    .description('编译项目')
    .option('--verbose', '更加详细的log')
    .option('-w, --watch', '监听文件改动')
    .option('-N, --no-cache', '不使用缓存')
    .option('-m, --multi', '三方开发模式，一次编译出多个项目')
    .option('-p, --project <project>', '三方开发模式，单独指定需要编译监听的项目')
    .option('--max-watch-project <max>', '三方开发模式，最多同时监听几个项目, default: 3')
    .action(async (cmd)=>{
        // console.log(cmd);
        logger.infoNow('Hello', `This is ${chalk.keyword('orange')('wxa@'+version)}, Running in ${chalk.keyword('orange')(process.env.NODE_ENV || 'development')}`);
        let wxaConfigs = getWxaConfigs();
        // console.log(cmd);
        let newBuilder = async (instance, cmdOptions)=> {
            // overide third party options.
            let subWxaConfigs;
            if (instance) {
                instance.wxaConfigs = instance.wxaConfigs || {};
                instance.wxaConfigs.thirdParty = instance;
                subWxaConfigs = Object.assign({}, wxaConfigs, instance.wxaConfigs, {$name: instance.name});
            } else {
                subWxaConfigs = Object.assign({}, wxaConfigs, {$name: 'Default'});
            }

            let builder = new Builder(subWxaConfigs);
            applyPlugins(builder.wxaConfigs.plugins || [], builder);

            await builder.build(cmdOptions);
        };

        if (cmd.multi && wxaConfigs.thirdParty && wxaConfigs.thirdParty.length) {
            // third party development
            if (cmd.project) {
                cmd.project.split(',').forEach((project)=>{
                    // console.log(project);
                    // specify project to compile
                    project = wxaConfigs.thirdParty.find((instance)=>instance.name===project);

                    if (!project) {
                        logger.errorNow('找不到指定的项目，请检查wxa.config.js中的三方配置');
                        process.exit(0);
                    } else {
                        newBuilder(project, cmd);
                    }
                });
            } else {
                // compile and watch all projects.
                wxaConfigs.thirdParty.forEach((instance)=>{
                    newBuilder(instance, {...cmd, watch: false});
                });
            }
        } else {
            // normal build.
            newBuilder(void(0), cmd);
        }
    });

commander
    .command('create <template> <projectname>')
    .description('新建模板')
    .option('--prefix', '模板地址前缀 默认：https://github.com/Genuifx')
    .action((template, projectname, cmd)=>{
        // console.log(template, projectname);
        new Creator(cmd).clone(template, projectname);
    });

commander
    .command('cli <action>')
    .description('微信开发者工具命令行调用')
    .option('-p, --path <path>', '项目路径, 默认当前目录下的dist文件')
    .option('-m, --desc <desc>', '上传代码时的备注')
    .option('--ver <ver>', '版本号')
    .action((action, cmd)=>{
        let wxaConfigs = getWxaConfigs();

        let newCli = (instance, cmd)=>{
            // overide third party options.
            instance.wxaConfigs = instance.wxaConfigs || {};
            instance.wxaConfigs.thirdParty = instance;
            let subWxaConfigs = Object.assign({}, wxaConfigs, instance.wxaConfigs, {$name: instance.name});

            let cli = new Toolcli(subWxaConfigs);

            cli.run(cmd);
        };

        if (cmd.multi && wxaConfigs.thirdParty && wxaConfigs.thirdParty.length && cmd.action !== 'open') {
            // third party development
            if (cmd.project) {
                cmd.project.split(',').forEach((project)=>{
                    // console.log(project);
                    // specify project to compile
                    project = wxaConfigs.thirdParty.find((instance)=>instance.name===project);

                    if (!project) {
                        logger.errorNow('找不到指定的项目，请检查wxa.config.js中的三方配置');
                        process.exit(0);
                    } else {
                        newCli(project, cmd);
                    }
                });
            } else {
                // compile and watch all projects.
                wxaConfigs.thirdParty.forEach((instance)=>{
                    newCli(instance, {...cmd});
                });
            }
        } else {
            // normal build.
            newCli(void(0), cmd);
        }


        // let toolcli = new Toolcli();
        // switch (action) {
        //     case 'open': {
        //         toolcli.open(cmd).catch((e)=>(e));
        //         break;
        //     }
        //     case 'login': {
        //         toolcli.login().catch((e)=>(e));
        //         break;
        //     }
        //     case 'preview': {
        //         toolcli.preview(cmd).catch((e)=>(e));
        //         break;
        //     }
        //     case 'upload': {
        //         toolcli.upload(cmd).catch((e)=>(e));
        //         break;
        //     }
        //     default: ('无效的命令');
        // }
    });

commander.parse(process.argv);

