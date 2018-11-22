import {exec} from 'child_process';
import logger from './helpers/logger';
import fs from 'fs';
import path from 'path';
import shell from 'shelljs';

class Creator {
    constructor(cmd) {
        this.cmdOptions = cmd;
        this.prefix = 'https://github.com/Genuifx';
    }

    run({projectName, template}) {
        this.clone(template, projectName);
    }

    clone(template, name) {
        let full = `${this.prefix}/wxa-templates.git`;

        exec(`git clone ${full} ${name}`, function(err, stdout, stderr) {
            if (err) {
                logger.error(err);
            } else {
                logger.info('clone', `成功下载模板 ${full}`);
                try {
                    let cwd = process.cwd();
                    let tmpDir = Date.now()+`_${template}`;

                    shell.cp('-Rf', path.join(cwd, `./${name}/${template}/`), path.join(cwd, tmpDir));
                    shell.rm('-rf', path.join(cwd, `./${name}/`));
                    shell.mv(path.join(cwd, tmpDir), path.join(cwd, `${name}/`));

                    let filepath = path.join(process.cwd(), `${name}/package.json`);
                    let pkg = require(filepath);
                    pkg.name = name;
                    fs.writeFileSync(filepath, JSON.stringify(pkg, null, 4));
                    logger.info('success', '新建成功，请注意安装依赖');
                } catch (e) {
                    logger.error(e);
                }
            }
        });
    }
}

export default Creator;
