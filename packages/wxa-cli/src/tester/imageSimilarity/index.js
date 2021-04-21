import {execSync} from 'child_process';
import path from 'path';
const pyPath = path.join(__dirname, './init.py');

export function diff(timeStamp, caseList) {
    // 测试结果图片校准
    if (!Array.isArray(caseList) || caseList.length == 0 || !timeStamp) return;
    const argv = caseList.join(',');
    let executable = {
        darwin: 'python3',
        win32: 'python',
    };
    execSync(`${executable[process.platform]} "${pyPath}" ${timeStamp} ${argv}`, {
        stdio: 'inherit',
    });
    return process.exit(0);
}
