import path from 'path';
import {exec} from 'child_process';
import {getConfig, info} from './utils';

class Toolcli {
    constructor(src, dist) {
        this.src = src || 'src';
        this.dist = dist || 'dist';
        let configs = getConfig();

        this.appPath = configs.wechatwebdevtools || '/Applications/wechatwebdevtools.app';
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

        this.cli = `${this.appPath}${this.cliPath}`;
    }

    execute(command) {
        return new Promise((resolve, reject)=>{
            exec(command, (err, stout, stderr)=>{
                if (err) {
                    reject(err);
                }
                resolve(stout);
            });
        }).stdout.on('data', (msg)=>{
            info('upload', msg);
        });
    }

    open(cmd) {
        let projectMenu = process.cwd() + path.sep + this.dist;
        if (cmd.path) projectMenu = cmd.path;
        return this.execute(`${this.cli} -o ${projectMenu}`);
    }

    login(cmd) {
        return this.execute(`${this.cli} -l`);
    }

    preview(cmd) {
        let projectMenu = process.cwd() + path.sep + this.dist;
        if (cmd.path) projectMenu = cmd.path;
        return this.execute(`${this.cli} -p ${projectMenu}`);
    }
    upload(cmd) {
        let projectMenu = process.cwd() + path.sep + this.dist;
        if (cmd.path) projectMenu = cmd.path;
        return this.execute(`${this.cli} -u ${cmd.ver}@${projectMenu} --upload-desc '${cmd.desc}'`);
    }
}

export default Toolcli;
