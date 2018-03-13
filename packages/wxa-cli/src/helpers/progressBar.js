// inspired by https://medium.com/@bargord11/write-your-first-node-js-terminal-progress-bar-5bd5edb8a563
import {bgWhite} from 'chalk';

export default class ProgressBar {
    constructor() {
        this.total;
        this.current;
        this.bar_length = process.stdout.columns - 24;
    }

    init(total) {
        this.total = total;
        this.current = 0;
        this.update(this.current);
    }

    update(current) {
        this.current = current;
        const currentProgress = this.current / this.total;
        // console.log(this.current, this.total);
        this.draw(currentProgress);
    }

    draw(currentProgress) {
        const filledBarLength = (currentProgress * this.bar_length).toFixed(0);
        const emptyBarLength = this.bar_length - filledBarLength;

        const filledBar = this.getBar(filledBarLength, ' ', bgWhite);
        const emptyBar = this.getBar(emptyBarLength, '-');
        const percentageProgress = (currentProgress * 100).toFixed(2);

        process.stdout.clearLine();
        process.stdout.cursorTo(0);
        process.stdout.write(
            `Compiling: [${filledBar}${emptyBar}] | ${percentageProgress}% `
        );
    }

    getBar(length, char, color=(a)=>a) {
        let str = '';
        for (let i = 0; i < length; i++) {
            str += char;
        }
        return color(str);
    }

    clean() {
        process.stdout.clearLine();
        process.stdout.cursorTo(0);
    }
}
