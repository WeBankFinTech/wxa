const chokidar = require('chokidar');
const path = require('path');
const build = require('./build');

const src = path.join(__dirname, '../src');
const dist = path.join(__dirname, '../dist');

let isWatchReady = false;

chokidar.watch(src)
.on('change', async (filepath) => {
    if (isWatchReady) {
        console.log('> changed ', filepath);
        await build(src, dist, true);
    }
})
.on('ready', async ()=>{
    await build(src, dist, true);
    isWatchReady = true;
    console.info('开始监听');
});
