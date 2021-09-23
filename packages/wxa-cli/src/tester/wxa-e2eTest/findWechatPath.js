/*
Windows 环境下去主动查找微信开发者工具安装目录
uct8086 2021-07-08
*/
const fs = require('fs');
const os = require('os');
const sys_readfile = require('util').promisify(fs.readFile);
const path = require('path');
const CONFIG_PATH = '微信web开发者工具';
const DEFAULT_PATH = ['Program Files (x86)/Tencent/微信web开发者工具', 'Program Files/Tencent/微信web开发者工具'];
const PAN = ['C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];

class FindWechatPath {
    static async start() {
        // 只查Windows平台
        const platform = os.platform();
        if (platform !== 'win32') {
            console.log('Non-Windows system, skip');
            return;
        }
        // 有缓存文件就直接读取
        const exists = await fs.existsSync(`${__dirname}/wechat.cfg`);
        if (exists) {
            const oldPath = await sys_readfile(`${__dirname}/wechat.cfg`, 'utf-8');
            let isDir = await this.checkFile(oldPath);
            if (isDir) return oldPath;
        }
        let start = new Date().getTime();
        let tempPath = '';
        label:
        for (let dir of PAN) { // 初步查找
            for (let cur of DEFAULT_PATH) {
                const currentPath = `${dir}:/${cur}`;
                let isDir = await this.checkFile(currentPath);
                if (isDir) {
                    tempPath = currentPath;
                    break label;
                }
            }
        }
        // console.log(tempPath);
        if (tempPath) {
            await fs.writeFileSync(`${__dirname}/wechat.cfg`, tempPath);
            return tempPath;
        }
        for (let dir of PAN) { // 深度查找
            let p = `${dir}:`;
            const a = await this.getFullList(p, 0);
            if (a !== 'begin') {
                let end = new Date().getTime();
                let time = end - start;
                console.log(time, a);
                await fs.writeFileSync(`${__dirname}/wechat.cfg`, a);
                return a;
            }
        }
        return tempPath;
    }

    static async getFullList(dirName) {
        let deep = dirName.replace('/', '\\').split('\\').length;
        if (deep >= 4) { // 最深不超过4层
            console.log(dirName);
            return 'begin';
        }
        let filePath = path.resolve(`${dirName}`);
        return new Promise((resolve) => {
            fs.readdir(filePath, async (err, files) => {
                let final = 'begin';
                if (err) {
                    resolve(final);
                } else {
                    for (let filename of files) {
                        let filedir = path.join(filePath, filename);
                        let isDir = await this.checkFile(filedir);
                        // console.log(isDir, filedir );
                        if (CONFIG_PATH === filename) {
                            console.log('2', filedir);
                            return resolve(filedir);
                        } else if (isDir) {
                            let innerDir = `${filePath}/${filename}`;
                            final = await this.getFullList(innerDir);
                            if (final !== 'begin') return resolve(final);
                        }
                    };
                }
                resolve(final);
            });
        });
    }
    
    static async checkFile(filedir) {
        return new Promise((resolve) => {
            fs.stat(filedir, function(eror, stats) {
                if (eror) {
                    return resolve(false);
                } else {
                    let isDir = stats.isDirectory(); // 是文件夹
                    if (isDir) {
                        return resolve(true);
                    }
                    resolve(false);
                }
            });
        });
    }
}

module.exports = FindWechatPath;
