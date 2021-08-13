import {writeFile} from '../../utils';
import path from 'path';
import {e2eStartTools} from './e2eTestCase2js.js';
import {exec} from 'child_process';
import FindWechatPath from './findWechatPath';

export default async function(cmd, wxaConfigs) {
    let testDir = path.join(process.cwd(), cmd.outDir);
    // 开发者工具clipath
    let clipath = {
        darwin: '/Contents/MacOS/cli',
        win32: `/cli.bat`,
    };
    let {cliPath} = cmd;
    let wechatwebdevtools = wxaConfigs.wechatwebdevtools;
    // window才查路径
    if (process.platform === 'win32' && (!wechatwebdevtools || wechatwebdevtools === '/Applications/wechatwebdevtools.app')) {
        console.log('find wechatWebDevTools......', process.platform);
        cmd.elog && cmd.elog.info('find wechatWebDevTools......', process.platform);
        wechatwebdevtools = await FindWechatPath.start();
        cmd.elog && cmd.elog.info('wechatwebdevtools: ', wechatwebdevtools);
        console.log('wechatwebdevtools: ', wechatwebdevtools);
    }
    
    let cli = cliPath || path.join(wechatwebdevtools, clipath[process.platform]);
    try {
        let recordString = await e2eStartTools({
            cliPath: cli.split(path.sep).join('/'),
        });
        writeFile(path.join(testDir, '.cache', 'start.test.js'), recordString);
    } catch (err) {
        console.log(err);
        cmd.elog && cmd.elog.error('write file start.test.js fail. ', err);
        process.exit(-1);
    }
    try {
        exec(`node ${path.join(testDir, '.cache', 'start.test.js').split(path.sep).join('/')}`, {
            stdio: 'inherit'
        });
        cmd.elog && cmd.elog.info(`wechat tools started`);
        console.log(`wechat tools started`);
    } catch (err) {
        process.exit(-1);
    }
}
