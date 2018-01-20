import commander from 'commander';
import compiler from './compiler';

commander.usage('[command] <options ...>');
commander.option('-w, --watch', '监听文件改动');
commander.command('build').description('编译项目').action((projectpath)=>{
    // console.log(commander);
    compiler.build(commander);
});

commander.parse(process.argv);
