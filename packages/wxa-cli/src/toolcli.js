import path from 'path';
import {exec} from 'child_process';
import logger from './helpers/logger';
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

    async run(cmd) {
        debug('start cli %O', cmd);
        this.$run(this.wxaConfigs.output.path, cmd);
    }

    $run(projectPath, cmd) {
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
                this.upload(projectPath, cmd).catch((e)=>logger.error(e));
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

    upload(projectPath, cmd) {
        return this.execute(`${this.cli} -u ${cmd.options.version}@${projectPath} --upload-desc '${cmd.options.desc}'`);
    }
}

export default Toolcli;

export function spawnDevToolCli(configs, cmdOptions) {
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
}
