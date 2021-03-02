import { formatDate, writeFile } from '../../utils';
import path from 'path';
import fs from 'fs';
import testCase2js from './e2eTestCase2js.js';
import {exec, execSync} from 'child_process';
import mockWxMethodConfig from './mockWxMethodConfig';

// -t 跑测试用例
// -s --screenshot 进行截屏比对
// --base 截屏作为expected基准，不对截屏进行比对
export default async function(cmd, wxaConfigs) {

    const sleep = t => new Promise(resolve => setTimeout(resolve, t));
    let testDir = path.join(process.cwd(), cmd.outDir);
    // --test=“xxx”指定用例，或--test默认执行outDir下所有用例
    // 要执行用例的目录名
    let testCaseNameArr = [];
    let stat = fs.lstatSync(testDir);
    // 不存在测试用例目录
    if (!stat.isDirectory()){
        throw new Error(`${testDir}非文件目录，请用--out-dir传入测试用例目录地址`)
    }
    if (typeof cmd.test === 'string') {
        testCaseNameArr = cmd.test.split(',');
    } else {
        let files = fs.readdirSync(testDir);
        files.forEach((item) => {
            if (item === '.cache') {
                return;
            }
            let stat = fs.lstatSync(path.join(testDir, item));
            if (!stat.isDirectory()){
                return;
            }
            testCaseNameArr.push(item);
        })
    }
    // 开发者工具clipath
    let clipath = {
        darwin: '/Contents/MacOS/cli',
        win32: '/cli.bat',
    };
    let {cliPath} = cmd;
    let cli = cliPath || path.join(wxaConfigs.wechatwebdevtools, clipath[process.platform]);

    // 截图目录
    let screenshotPath = '';
    if (cmd.base) {
        screenshotPath = 'base_screenshot';
    } else {
        let timeStamp = formatDate(+new Date());
        screenshotPath = timeStamp;
    }
    try {
        let recordString = await testCase2js({
            cliPath: cli,
            testCaseNameArr: JSON.stringify(testCaseNameArr),
            testDir,
            screenshotPath,
            base: !!cmd.base,
            screenshotDiff: !!cmd.screenshotDiff,
            noMockApi: !!cmd.noMock,
            customExpect: !!cmd.customExpect,
            mockWxMethodConfig
        });
        writeFile(path.join(testDir, '.cache', 'index.test.js'), recordString)
    } catch (err) {
        console.log(err);
        process.exit(-1);
    }


    try {
        execSync(`jest ${path.join(testDir, '.cache', 'index.test.js')}`, {
            stdio: 'inherit'
        });
        process.exit(0);
    } catch(err) {
        process.exit(-1);
    }


}
