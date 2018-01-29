import commander from 'commander';
import compiler from './compiler';
import chalk from 'chalk';
import {info} from './utils';

const version = require('../package.json').version;
info('Hello', `This is ${chalk.keyword('orange')('wxa@'+version)}, Running in ${chalk.keyword('orange')(process.env.NODE_ENV || 'development')}`);

commander.usage('[command] <options ...>');
commander.option('-w, --watch', '监听文件改动');
commander.command('build').description('编译项目').action((projectpath)=>{
    // console.log(commander);
    compiler.build(commander);
});

commander.parse(process.argv);

