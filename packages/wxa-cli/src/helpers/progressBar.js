// inspired by https://medium.com/@bargord11/write-your-first-node-js-terminal-progress-bar-5bd5edb8a563
import {white, green, blue, yellow} from 'chalk';
import readline from 'readline';

class ProgressBar {
    constructor() {
        this.total;
        this.current;
        this.bar_length = Math.floor( Math.max(0, process.stdout.columns / 2 - 24) );
        this.incomplete = '-';
        this.complete = '=';
        this.colorMap = {
            25: white,
            50: yellow,
            80: blue,
            100: green,
        };

        process.stdout.on('resize', ()=> {
            this.bar_length = Math.floor( Math.max(0, process.stdout.columns / 2 - 24) );
        });
    }

    init(total) {
        this.total = total;
        this.current = 0;
        this.update(this.current);
    }

    update(current) {
        this.current = current;
        const currentProgress = this.current / this.total;
        this.draw(currentProgress);
    }

    draw(currentProgress) {
        const percent = (currentProgress * 100).toFixed(2);
        const filledBarLength = ~~(+currentProgress * this.bar_length);

        let colorFn = this.findColor(percent);
        const filledBar = colorFn(Array(Math.max(0, filledBarLength)).join(this.complete));
        const emptyBar = Array(Math.max(0, +this.bar_length - filledBarLength)).join(this.incomplete);

        this.clean();
        process.stdout.write(
            `Compiling: [${filledBar}${emptyBar}] | ${colorFn(percent)}% `
        );
    }

    findColor(percent) {
        let k = Object.keys(this.colorMap).find((key)=>{
            return +key>=+percent;
        });
        return this.colorMap[k] || ((a)=>a);
    }

    clean() {
        readline.clearLine(process.stdout);
        readline.cursorTo(process.stdout, 0);
    }
}


export default new ProgressBar();
