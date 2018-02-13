import commander from 'commander';
import Compiler from './compiler';
import chalk from 'chalk';
import {info} from './utils';

const version = require('../package.json').version;

commander.usage('[command] <options ...>');
commander.option('-w, --watch', '监听文件改动');
commander.command('build').description('编译项目').action((projectpath)=>{
    // console.log(commander);
    info('Hello', `This is ${chalk.keyword('orange')('wxa@'+version)}, Running in ${chalk.keyword('orange')(process.env.NODE_ENV || 'development')}`);
    new Compiler().build(commander);
});
commander.command('version').description('版本').action((projectpath)=>{
    info('version', version);
});

commander.parse(process.argv);

