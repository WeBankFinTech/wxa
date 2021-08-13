/* 
配置文件，写入本地脚本中，其他接口通过读取本地脚本获取参数
*/
import {getConfigs} from './getConfigs';
import {isEmpty} from './utils';
import {WXA_PROJECT_NAME} from './const/wxaConfigs';
import Tester from './tester/index';
import chalk from 'chalk';
const fs = require('fs');
const {chdir, cwd} = require('process');
const version = require('../package.json').version;
const CFG_FILE = 'project.cfg';
const sysReadfile = require('util').promisify(fs.readFile);
const processProjectsOptions = (configs, cmdOptions) => {
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


// commander
// .command('test')
// .description('测试模式')
// .option('-e, --e2e', 'e2e测试模式')
// .option('-p, --port', '监听端口')
// .option('-o, --out-dir [outDir]', '测试用例输出文件夹', '__wxa_e2e_test__')
// .option('--cli-path [cliPath]', '微信开发者工具路径')
// .option('-r, --record', 'e2e测试录制模式，启动小程序自动开始录制')
// .option('-t, --test [testName]', 'e2e执行测试用例，缺省则执行所有用例，多个用例名用逗号区分')
// .option('--base', '仅截屏，作为后续回放用例比较基准')
// .option('--screenshot-diff [screenshotDiff]', '是否进行截屏比对')
// .option('--custom-expect', '进行自定义期望匹配，record.js里每一步的customExpect函数编写期望代码')
// .option('--py-diff [pyDiff]', '是否使用python进行相似度比对')
// .option('--no-mock', '不mock接口')
// .option('--verbose', '展示多余的信息')
// .option('--no-progress', '不展示文件进度')
// .option('--project-name <projectName>', '项目名')
// .action((cmd)=>{
//     showSlogan();
//     let wxaConfigs = getConfigs();
//     processProjectsOptions(wxaConfigs, cmd);
    
//     let [target] = cmd.project;
//     let projectConfigs = wxaConfigs.find((item)=> item.name === target);
    
//     console.info(`➰ Tester Mode. Building with ${chalk.keyword('orange')(process.env.NODE_ENV || 'development')} env. ${target.toUpperCase()}` );
//     new Tester(cmd, projectConfigs).build();
// });
// "version": "1.1.6-test-v34",


class ExposeInterface {

    constructor(elog) {
        this.elog = elog;
    }

    async startE2E(cmd) { // 启动
        try {
            this.elog.info(`🖖 Hi, @wxa version ${chalk.keyword('orange')(''+version)} present`);
            const projPath = await this.getProjPath();
            chdir(projPath);
            this.elog.info(`current cwd path: ${cwd()}`);
            if (!projPath) return {code: -1, msg: 'can not found proj path.'};
            let wxaConfigs = getConfigs();
            cmd.elog = this.elog; // 设置客户端日志对象
            processProjectsOptions(wxaConfigs, cmd);
            let [target] = cmd.project;
            let projectConfigs = wxaConfigs.find((item)=> item.name === target);
            this.elog.info(`➰ Tester Mode. Building with ${chalk.keyword('orange')(process.env.NODE_ENV || 'development')} env.` );
            new Tester(cmd, projectConfigs).build();
        } catch (e) {
            this.elog.error(e);
            return {code: -2, msg: 'record error'};
        }
    }

    async setPath(path) { // 设置参数
        try {
            let content = {};
            const exists = await fs.existsSync(`${__dirname}/${CFG_FILE}`);
            if (exists) {
                content = await sysReadfile(`${__dirname}/${CFG_FILE}`, 'utf-8');
                content = JSON.parse(content);
            }
            content.projPath = path;
            await fs.writeFileSync(`${__dirname}/${CFG_FILE}`, JSON.stringify(content));
            return {code: 1};
        } catch (err) {
            this.elog.error(err);
            return {code: -1, err};
        }
    }
    async getProjPath() { // 获取参数
        try {
            const exists = await fs.existsSync(`${__dirname}/${CFG_FILE}`);
            if (!exists) return;
            let content = await sysReadfile(`${__dirname}/${CFG_FILE}`, 'utf-8');
            content = JSON.parse(content);
            this.elog.info('content.projPath', content.projPath);
            return content.projPath;
        } catch (err) {
            this.elog.error(err);
            return;
        }
        
    }
}

module.exports = ExposeInterface;
