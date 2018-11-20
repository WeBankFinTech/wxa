import chalk from 'chalk';
import bar from './progressBar';
import notifier from 'node-notifier';

class Logger {
    constructor() {
        this.errors = [];
        this.log = [];
        this.warnning = [];

        this.map = new Map([
            ['log', {color: chalk.bold.greenBright, info: console.log.bind(console)}],
            ['info', {color: chalk.bold.cyanBright, info: console.info.bind(console)}],
            ['warn', {color: chalk.bold.yellow, info: console.info.bind(console)}],
            ['error', {color: chalk.red, info: (...args)=>{
                    console.log('');
                    console.error.bind(console)(...args);
                },
            }],
        ]);

        this.map.forEach((fn, key)=>{
            this[key] = (...args)=>{
                if (args.length > 1) {
                    fn.info(fn.color(`> ${args[0]}`), ...args.slice(1));
                } else {
                    fn.info(...args);
                }
            };
        });
    }

    showError(err) {
        if (err == null) return;

        if (err.name) {
            let line = err.line || err.lineNumber || (err.loc && err.loc.line);
            let column = err.column || err.columnNumber || (err.loc && err.loc.column);

            console.info(
                chalk.bgRedBright(`[${err.name}]`),
                err.file || '',
                line ? `line: ${line} column: ${column}` : ''
            );
        }
        if (err.message) {
            console.info(chalk.redBright(err.message));
        } else {
            console.error(err);
        }
    }
}

export default new Logger();
