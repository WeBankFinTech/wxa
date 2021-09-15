const fs = require('fs');
const ejs = require('ejs');
const path = require('path');
const {execSync} = require('child_process');

const e2eRecord2js = (data) => {
    return new Promise((resolve, reject) => {
        ejs.renderFile(path.join(__dirname + '/e2eTestCaseTpl.ejs'), data, (err, str) => {
            if (err) {
                return reject(err);
            }
            resolve(str);
        });
    });
};

const e2eStartTools = (data) => {
    return new Promise((resolve, reject) => {
        ejs.renderFile(path.join(__dirname + '/e2eTpl.ejs'), data, (err, str) => {
            if (err) {
                return reject(err);
            }
            resolve(str);
        });
    });
};

const e2eStaticWeb2js = (data) => {
    return new Promise((resolve, reject) => {
        ejs.renderFile(path.join(__dirname, './e2eResultTpl.ejs'), data, (err, str) => {
            if (err) {
                return reject(err);
            }
            resolve(str);
        });
    });
};

async function findBrewNodeBin(type) {
    try {
        const result = execSync(`find /usr/local -name ${type}`);
        let stdout = result.toString();
        const list = stdout.split('\n');
        if (list.length !== 0) {
            const locate = list.find((item) => item.endsWith(`/bin/${type}`));
            if (locate) return locate;
        }
        console.log('you need install node.js.');
        return '';
    } catch (e) {
        console.log(`findVrewNodeBin path error is : ${e && e.message || ''}`);
        return '';
    }
}

async function checkServer(pName) {
    let cmd = process.platform === 'win32' ? 'tasklist' : 'lsof -c node';
    if (process.platform !== 'win32' && pName !== 'node') cmd = 'ps aux';
    console.log('exitserver.');
    const result = execSync(cmd);
    let stdout = result.toString();
    const list = stdout.split('\n');
    for (let processMessage of list) {
      let pms = processMessage.trim().split(/\s+/);
      if (process.platform === 'win32') {
        let processName = pms[0]; // processMessage[0]进程名称 ， processMessage[1]进程id
  
        if (processName && processName.startsWith(pName)) {
          return true;
        }
      } else {
        let processName = pms[10];
  
        if (pName !== 'node' && processName && processName.includes(pName) || pName === 'node') {
          return true; // 未验证
        }
      }
    }
    return false;
  }
module.exports = {
    e2eRecord2js,
    e2eStartTools,
    e2eStaticWeb2js,
    findBrewNodeBin,
    checkServer,
};
