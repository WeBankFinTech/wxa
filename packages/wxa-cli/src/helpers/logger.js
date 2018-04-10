import chalk from 'chalk';
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
        if (msg) console.error(chalk.red(msg));
        if (err) console.trace(err);

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
            if (err) console.trace(err);
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
        if (type && type === 'message') {
            console.info(chalk.magenta(`[${title}]`), msg);
        } else {
            console.info(chalk.green(`[${title}]`), msg);
        }
    }
}

export default new Logger();
