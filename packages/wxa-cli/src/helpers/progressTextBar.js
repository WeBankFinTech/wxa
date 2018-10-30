// inspired by https://medium.com/@bargord11/write-your-first-node-js-terminal-progress-bar-5bd5edb8a563
import {greenBright} from 'chalk';
import path from 'path';
import readline from 'readline';

class ProgressBar {
    constructor(cwd, wxaConfigs) {
        this.cwd = cwd;
        this.wxaConfigs = wxaConfigs;

        process.stdout.on('resize', ()=> {
            // this.bar_length = Math.floor( Math.max(0, (process.stdout.columns || 100) / 2 - 24) );
        });
    }

    draw(url) {
        let name = path.relative(this.cwd, url);

        this.clean();
        process.stdout.write(
            `${greenBright('Compiling')}: ${name}`
        );
    }

    clean() {
        readline.clearLine(process.stdout);
        readline.cursorTo(process.stdout, 0);
    }
}


export default ProgressBar;
