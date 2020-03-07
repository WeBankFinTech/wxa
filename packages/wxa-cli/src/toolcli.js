import path from 'path';
import {exec} from 'child_process';
import logger from './helpers/logger';
import inquirer from 'inquirer';
import debugPKG from 'debug';

const debug = debugPKG('WXA:Toolcli');

class Toolcli {
    constructor(wxaConfigs) {
        this.cwd = process.cwd();
        this.wxaConfigs = wxaConfigs;

        this.appPath = this.wxaConfigs.wechatwebdevtools || '/Applications/wechatwebdevtools.app';
        // console.log(process.platform);
        // /Applications/wechatwebdevtools.app/Contents/Resources/app.nw/bin/cli
        if (['darwin', 'win32'].indexOf(process.platform) >-1) {
            let clipath = {
                darwin: '/Contents/Resources/app.nw/bin/cli',
                win32: '/cli.bat',
            };
            this.cliPath = clipath[process.platform];
        } else {
            throw new Error('微信开发者工具不支持的系统类型');
        }

        this.cli = path.normalize(`"${this.appPath}${this.cliPath}"`);
    }

    async run(cmd, data) {
        debug('start cli %O', cmd);
        this.$run(this.wxaConfigs.output.path, cmd, data);
    }

    $run(projectPath, cmd, data) {
        let {action} = cmd;

        switch (action) {
            case 'open': {
                this.open(cmd).catch((e)=>logger.error(e));
                break;
            }
            case 'login': {
                this.login().catch((e)=>logger.error(e));
                break;
            }
            case 'preview': {
                this.preview(projectPath, cmd).catch((e)=>logger.error(e));
                break;
            }
            case 'upload': {
                this.upload(projectPath, cmd, data).catch((e)=>logger.error(e));
                break;
            }
            default: logger.warn('无效的命令');
        }
    }

    execute(command) {
        debug('command to execute %s', command);
        return new Promise((resolve, reject)=>{
            let cp = exec(command, (err, stout, stderr)=>{
                if (err) {
                    reject(err);
                }
                resolve(stout);
            });
            cp.stdout.on('data', (msg)=>{
                console.log(msg);
            });
            cp.stderr.on('data', (err)=>{
                console.log(err);
            });
            cp.on('close', (code)=>{
                console.log(code);
            });
        });
    }

    open(projectPath, cmd) {
        return this.execute(`${this.cli} -o ${projectPath}`);
    }

    login(cmd) {
        return this.execute(`${this.cli} -l`);
    }

    preview(projectPath, cmd) {
        return this.execute(`${this.cli} -p ${projectPath}`);
    }

    upload(projectPath, cmd, data) {
        return this.execute(`${this.cli} -u ${data.options.version}@${projectPath} --upload-desc '${data.options.desc}'`);
    }
}

export default Toolcli;

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

export async function spawnDevToolCli(configs, cmdOptions) {
    let answer;
    if (cmdOptions.action === 'upload') answer = await question();

    let projects = cmdOptions.project;

    for (let name of projects) {
        let projectConfigs = configs.find((item) => item.name === name);

        if (!projectConfigs) {
            logger.error(`找不到${name}的项目配置文件，请检查wxa.config.js中的三方配置`);
            break;
        }

        let cli = new Toolcli(projectConfigs);

        cli.run(cmdOptions, {options: answer});
    }
}
