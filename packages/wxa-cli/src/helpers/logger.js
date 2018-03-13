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

    info(title, msg) {
        this.log.push({
            title: title[0].toUpperCase()+title.slice(1),
            type: 'log',
            msg,
        });

        return this;
    }

    message(title, msg) {
        this.info(title, msg);

        return this;
    }

    warn(msg) {
        this.warnning.push({
            type: 'warn',
            msg,
        });

        return this;
    }

    show() {
        this.warnning.forEach((obj)=>{
            console.warn(obj.msg);
        });
        this.errors.forEach((obj)=>{
            let {msg, err} = obj;
            if (msg) console.error(chalk.red(msg));
            if (err) console.trace(err);
        });
        this.log.forEach((obj)=>{
            let {title, msg} = obj;

            console.info(chalk.green(`[${title}]`), msg);
        });

        this.warnning = [];
        this.log = [];
        this.errors = [];

        return this;
    }
}

export default new Logger();
