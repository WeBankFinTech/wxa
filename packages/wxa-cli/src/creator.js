import {exec} from 'child_process';
import {error, info} from './utils';
import fs from 'fs';
import path from 'path';
class Creator {
    constructor(cmd) {
        this.options = cmd;
        this.prefix = cmd.prefix || 'https://github.com/Genuifx';
    }
    clone(template, name) {
        let full = `${this.prefix}/wxa-template-${template}.git`;
        if (/^http.*/gu.test(template)) {
            full = template;
        }
        exec(`git clone ${full} ${name}`, function(err, stdout, stderr) {
            if (err) {
                error(err);
            } else {
                info('clone', `成功下载 ${full}`);
                let filepath = path.join(process.cwd(), `${name}/package.json`);
                let pkg = require(filepath);
                pkg.name = name;
                fs.writeFileSync(filepath, JSON.stringify(pkg, null, 4));
                info('success', '新建成功');
            }
        });
    }
}

export default Creator;
