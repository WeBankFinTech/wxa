import path from 'path';
import E2ETester from './e2eTester';
import {execSync} from 'child_process';

const pyPath = path.join(__dirname, './imageSimilarity/init.py');

export default class TesterController {
    constructor(cmdOptions, wxaConfigs) {
        this.cmdOptions = cmdOptions;
        this.wxaConfigs = wxaConfigs;
    }

    build() {
        if (this.cmdOptions.e2e) {
            return new E2ETester(this.cmdOptions, this.wxaConfigs).build();
        }
    }
    
    // 测试结果图片校准
    async diff(timeStamp, caseList) {
        if (!Array.isArray(caseList) || caseList.length == 0 || !timeStamp) return;
        const argv = caseList.join('-');
        execSync(`python "${pyPath}" ${timeStamp} ${argv}`, {
            stdio: 'inherit',
        });
        return process.exit(0);
    }

}
