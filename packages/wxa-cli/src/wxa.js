import commander from 'commander';
import Compiler from './compiler';
import chalk from 'chalk';
// import {info, error, warn} from './utils';
import logger from './helpers/logger';
import Creator from './creator';
import Toolcli from './toolcli';

const version = require('../package.json').version;
commander
    .version(version, '-v, --version')
    .usage('[command] <options ...>');

commander
    .command('build')
    .description('编译项目')
    .option('--verbose', '更加详细的log')
    .option('-w, --watch', '监听文件改动')
    .option('-N, --no-cache', '不使用缓存')
    .action((cmd)=>{
        // console.log(cmd);
        logger.infoNow('Hello', `This is ${chalk.keyword('orange')('wxa@'+version)}, Running in ${chalk.keyword('orange')(process.env.NODE_ENV || 'development')}`);
        new Compiler().build(cmd);
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
        let toolcli = new Toolcli();
        switch (action) {
            case 'open': {
                toolcli.open(cmd).catch((e)=>error(e));
                break;
            }
            case 'login': {
                toolcli.login().catch((e)=>error(e));
                break;
            }
            case 'preview': {
                toolcli.preview(cmd).catch((e)=>error(e));
                break;
            }
            case 'upload': {
                toolcli.upload(cmd).catch((e)=>error(e));
                break;
            }
            default: warn('无效的命令');
        }
    });

commander.parse(process.argv);

