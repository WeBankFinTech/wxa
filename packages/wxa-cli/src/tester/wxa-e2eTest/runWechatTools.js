import {writeFile} from '../../utils';
import path from 'path';
import {e2eStartTools, findBrewNodeBin, checkServer} from './e2eTestCase2js.js';
import {exec, execSync} from 'child_process';
import FindWechatPath from './findWechatPath';

export default async function(cmd, wxaConfigs) {
    let testDir = path.join(process.cwd(), cmd.outDir);
    // 开发者工具clipath
    let clipath = {
        darwin: '/Contents/MacOS/cli',
        win32: `/cli.bat`,
    };
    let {
        cliPath,
        basePath,
      } = cmd;
      let wechatwebdevtools = basePath || wxaConfigs.wechatwebdevtools;
    // window才查路径
    if (process.platform === 'win32' && (!wechatwebdevtools || wechatwebdevtools === '/Applications/wechatwebdevtools.app')) {
        console.log('find wechatWebDevTools......', process.platform);
        cmd.elog && cmd.elog.info('find wechatWebDevTools......', process.platform);
        wechatwebdevtools = await FindWechatPath.start();
        cmd.elog && cmd.elog.info('wechatwebdevtools: ', wechatwebdevtools);
        console.log('wechatwebdevtools: ', wechatwebdevtools);
    }
    
    let cli = cliPath || path.join(wechatwebdevtools, clipath[process.platform]);
    const wechatToolPath = cli.split(path.sep).join('/');
    let projPath = path.join(process.cwd(), '/dist');
    projPath = projPath.replace(/\\/g, '/');
    try {
        let recordString = await e2eStartTools({
            cliPath: wechatToolPath,
            projectPath: projPath,
        });
        writeFile(path.join(testDir, '.cache', 'start.test.js'), recordString);
    } catch (err) {
        console.log(err);
        cmd.elog && cmd.elog.error('write file start.test.js fail. ', err);
        process.exit(-1);
    }
    try {
        if (process.platform !== 'win32') { // mac
            let nodeCmd = await findBrewNodeBin('node');
            console.log('node path : ', nodeCmd);
            let option = {
                env: {
                    PATH: process.env.PATH + ':/usr/local/lib/node_modules/node/bin:/usr/local/opt/node/bin:' + nodeCmd,
                },
                stdio: 'inherit',
            };
            exec(`${nodeCmd} ${path.join(testDir, '.cache', 'start.test.js').split(path.sep).join('/')}`, option);
        } else { // windows
            // cli --auto /Users/username/demo --auto-port 9420
            const started = await checkServer('wechatdevtools');
            if (started) { // 已经启动了开发者工具，就直接连接
                try {
                    cmd.elog && cmd.elog.info(`wechatdevtool is online, connect.`);
                    execSync(` cli --auto ${projPath} --auto-port 9420`, {cwd: wechatwebdevtools});
                } catch (e) {
                    cmd.elog && cmd.elog.info(`project already connected.`);
                    exec(`node ${path.join(testDir, '.cache', 'start.test.js').split(path.sep).join('/')}`, {
                        stdio: 'inherit',
                    });
                }
            } else { // 未启动开发者工具
                cmd.elog && cmd.elog.info(`wechat tools not start, starting...`);
                exec(`node ${path.join(testDir, '.cache', 'start.test.js').split(path.sep).join('/')}`, {
                    stdio: 'inherit',
                });
            }
        }
        
        cmd.elog && cmd.elog.info(`wechat tools started`);
        console.log(`wechat tools started`);
    } catch (err) {
        process.exit(-1);
    }
}
