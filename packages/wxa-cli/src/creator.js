import {exec} from 'child_process';
import logger from './helpers/logger';
import fs from 'fs';
import path from 'path';
import shell from 'shelljs';
import https from 'https';
import inquirer from 'inquirer';

let remoteMap = new Map([
    ['github', 'https://github.com/wxajs'],
    ['gitee', 'https://gitee.com/wxajs'],
]);

function getQATemplate(templateConfigs) {
    return [
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
    }
    ];
}
function getQAProjectName(projectName) {
    // 如果已经带name参数，不需要再次询问项目名
    if (projectName) {
        return [];
    }
    return [
    {
        type: 'input',
        name: 'projectName',
        message: '输入项目名',
        validate: (input)=>{
            return !(input == null || input === '');
        },
    }
    ];
}
function getQA(templateConfigs, projectName) {
    return [
        ...getQAProjectName(projectName),
        ...getQATemplate(templateConfigs)
    ]
}
class Creator {
    constructor(cmd) {
        this.cmdOptions = cmd;
        this.prefix = remoteMap.get(cmd.repo) || cmd.repo;
    }

    async run() {
        let options;
        try {
            // 先尝试从github、gitee远程拉取模版配置json，并询问项目名+模板类型
            let configs = await this.getRemoteConfigs();
            options = await inquirer.prompt(getQA(JSON.parse(configs), this.cmdOptions.projectName));
        } catch (err) {
            // getRemoteConfigs失败后，先询问项目名，clone git模版仓库，拿到模版再配置询问模版类型
                options = await inquirer.prompt(getQAProjectName(this.cmdOptions.projectName));
        }
        options.projectName = options.projectName || this.cmdOptions.projectName;
        this.create(options);
    }

    async create({projectName, template, ...rest}) {
        await this.clone(template, projectName, rest);
    }

    async clone(template, name, rest) {
        let full = `${this.prefix}/wxa-templates.git`;

        logger.info('Downloading', `正在从 ${full} 下载模板`);
        let childProcess = exec(`git clone ${full} ${name}`, async (err, stdout, stderr) => {
            if (err) {
                logger.error(err);
            } else {
                logger.info('Clone', `成功下载模板 ${full}`);
                try {
                    // 如果暂未选择对应模版（远程拉取到模版配置失败），在此时选择模版类型
                    if (!template) {
                        let configs = await this.getLocalConfigs(name);
                        let options = await inquirer.prompt(getQATemplate(JSON.parse(configs)));
                        template = options.template;
                        rest = options;
                    }
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

    getLocalConfigs(projectName) {
        const data = fs.readFileSync(path.resolve('./', projectName, 'configs.json'));
        return data;
    }

    getRemoteConfigs() {
        let data = '';
        // configs.json获取失败的话，就先clone项目再询问模版类型
        return new Promise((resolve, reject) => {
            let req = https.get(`${this.prefix}/wxa-templates/raw/master/configs.json`, (res)=>{
                res.on('data', (d)=>{
                    data += d.toString();
                });

                res.on('close', ()=>{
                    resolve(data);
                });
            }).on('error', (e)=>{
                reject(e);
            });
            req.end();
        });

    }
}

export default Creator;
