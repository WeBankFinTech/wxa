import chalk from 'chalk';
import bar from './progressBar';
import notifier from 'node-notifier';

class Logger {
    constructor() {
        this.errors = [];
        this.log = [];
        this.warnning = [];
    }

    error(msg, err) {
        this.errors.push({
            err,
            type: 'error',
            msg,
        });

        return this;
    }

    errorNow(msg, err) {
        bar.clean();

        if (msg) {
            // console.log('\n');
            console.error(chalk.redBright(msg));
            notifier.notify({
                title: 'WXA ERROR',
                message: chalk.red(msg),
                sound: true,
                wait: true,
            });
        }
        if (err) this.showError(err);

        console.log('\n');
        return this;
    }

    info(title, msg, type='log', ...args) {
        let immediate = typeof args[args.length-1] === 'boolean' ? args[args.length-1] : false;

        let log = {
            title: title[0].toUpperCase()+title.slice(1),
            type,
            msg,
        };
        if (immediate) {
            this.printLog(log);
        } else {
            this.log.push(log);
        }


        return this;
    }

    infoNow(...args) {
        return this.info(...args, true);
    }

    message(title, msg, ...args) {
        this.info(title, msg, 'message', ...args);

        return this;
    }

    messageNow(...args) {
        return this.message(...args, true);
    }

    warn(msg) {
        this.warnning.push({
            type: 'warn',
            msg,
        });

        return this;
    }

    warnNow(...args) {
        return this.warn(...args, true);
    }

    show(showLog=false) {
        this.warnning.forEach((obj)=>{
            console.warn(obj.msg);
        });
        this.errors.forEach((obj)=>{
            let {msg, err} = obj;
            if (msg) console.error(chalk.red(msg));
            if (err) this.showError(err);
        });
        if (showLog) {
            this.log.forEach((obj)=>this.printLog(obj));
        }

        this.warnning = [];
        this.log = [];
        this.errors = [];

        return this;
    }

    printLog({type, title, msg}) {
        bar.clean();
        if (type && type === 'message') {
            console.info(chalk.magenta(`[${title}]`), msg);
        } else {
            console.info(chalk.green(`[${title}]`), msg);
        }
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
