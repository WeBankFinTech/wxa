import {exec} from 'child_process';
import logger from './helpers/logger';
import fs from 'fs';
import path from 'path';
import shell from 'shelljs';
import https from 'https';
import {isUri} from 'valid-url';
import inquirer from 'inquirer';

let remoteMap = new Map([
    ['github', 'https://github.com/wxajs'],
    ['gitee', 'https://gitee.com/wxajs'],
]);

function getQA(templateConfigs) {
    return [
    {
        type: 'input',
        name: 'projectName',
        message: '输入项目名',
        validate: (input)=>{
            return !(input == null || input === '');
        },
    },
    {
        type: 'list',
        name: 'template',
        message: '选择模板',
        default: 'base',
        choices: templateConfigs,
    },
    {
        type: 'input',
        name: 'appid',
        message: '小程序APPID',
        default: '',
    },
    ];
}
class Creator {
    constructor(cmd) {
        this.cmdOptions = cmd;
        this.prefix = isUri(cmd.repo) ? cmd.repo : remoteMap.get(cmd.repo);
    }

    async run() {
        let configs = await this.getRemoteConfigs();
        let options = await inquirer.prompt(getQA(JSON.parse(configs)));

        this.create(options);
    }

    create({projectName, template, ...rest}) {
        this.clone(template, projectName, rest);
    }

    clone(template, name, rest) {
        let full = `${this.prefix}/wxa-templates.git`;

        logger.info('Downloading', `正在从 ${full} 下载模板`);
        let childProcess = exec(`git clone ${full} ${name}`, function(err, stdout, stderr) {
            if (err) {
                logger.error(err);
            } else {
                logger.info('Clone', `成功下载模板 ${full}`);
                try {
                    let cwd = process.cwd();
                    let tmpDir = Date.now()+`_${template}`;

                    shell.cp('-Rf', path.join(cwd, `./${name}/${template}/`), path.join(cwd, tmpDir));
                    shell.rm('-rf', path.join(cwd, `./${name}/`));
                    shell.mv(path.join(cwd, tmpDir), path.join(cwd, `${name}/`));

                    const pkgFilepath = path.join(process.cwd(), `${name}/package.json`);
                    const pkg = require(pkgFilepath);
                    pkg.name = name;
                    fs.writeFileSync(pkgFilepath, JSON.stringify(pkg, null, 4));

                    // write project.config.json.
                    const projectConfig = {
                        'miniprogramRoot': './',
                        'compileType': 'miniprogram',
                        'appid': rest.appid || '',
                        'projectname': encodeURIComponent(name),
                    };

                    fs.writeFileSync(
                        path.join(process.cwd(), `${name}/src/project.config.json`),
                        JSON.stringify(projectConfig, null, 4)
                    );

                    logger.info('Success', '新建成功，请注意安装依赖');
                    if (!rest.appid) logger.warn('Noticed', '记得在 project.config.json 中指定 appid~');
                } catch (e) {
                    logger.error(e);
                }
            }
        });

        childProcess.on('error', (err) => {
            logger.error(err);
        });
        childProcess.on('message', (err) => {
            logger.info('Child Process', err);
        });
    }

    getRemoteConfigs() {
        let data = '';
        return new Promise((resolve, reject) => {
            let req = https.get(`${this.prefix}/wxa-templates/raw/master/configs.json`, (res)=>{
                res.on('data', (d)=>{
                    data += d.toString();
                });
                res.on('error', (e)=>{
                    reject(e);
                });
                res.on('close', ()=>{
                    resolve(data);
                });
            });

            req.end();
        });
    }
}

export default Creator;
