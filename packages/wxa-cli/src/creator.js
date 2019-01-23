import {exec} from 'child_process';
import logger from './helpers/logger';
import fs from 'fs';
import path from 'path';
import shell from 'shelljs';

class Creator {
    constructor(cmd) {
        this.cmdOptions = cmd;
        this.prefix = 'https://github.com/wxajs';
    }

    run({projectName, template, ...rest}) {
        this.clone(template, projectName, rest);
    }

    clone(template, name, rest) {
        let full = `${this.prefix}/wxa-templates.git`;

        exec(`git clone ${full} ${name}`, function(err, stdout, stderr) {
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
                        'projectname': name,
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
    }
}

export default Creator;
