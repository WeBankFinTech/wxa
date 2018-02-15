import commander from 'commander';
import Compiler from './compiler';
import chalk from 'chalk';
import {info} from './utils';
import Creator from './creator';

const version = require('../package.json').version;
commander
    .version(version, '-v, --version')
    .usage('[command] <options ...>');

commander
    .command('build')
    .description('编译项目')
    .option('-w, --watch', '监听文件改动')
    .option('-N, --no-cache', '不使用缓存')
    .action((cmd)=>{
        // console.log(cmd);
        info('Hello', `This is ${chalk.keyword('orange')('wxa@'+version)}, Running in ${chalk.keyword('orange')(process.env.NODE_ENV || 'development')}`);
        new Compiler().build(cmd);
    });

commander
    .command('create <template> <projectname>')
    .option('--prefix', '模板地址前缀 默认：https://github.com/Genuifx')
    .action((template, projectname, cmd)=>{
        // console.log(template, projectname);
        new Creator(cmd).clone(template, projectname);
    });
// commander.command('version').description('版本').action((projectpath)=>{
//     info('version', version);
// });

commander.parse(process.argv);

