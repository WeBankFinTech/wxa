import {exec} from 'child_process';

export class NpmManager {
    constructor() {
        this.npm = 'npm';
        this.category = '-D';
    }

    set(name, value) {
        this[name] = value;
    }

    exec(cmd) {
        return new Promise((resolve, reject)=>{
            exec(cmd, (err, std, str)=>{
                if (err) {
                    return reject(err);
                }
                resolve({std, str});
            });
        });
    }

    install(pkg, version='latest') {
        return this.exec(`${this.npm} install ${this.category} ${pkg}@${version}`);
    }

    uninstall(pkg) {
        return this.exec(`${this.npm} uninstall ${this.category} ${pkg}`);
    }

    update(pkg, version='latest') {
        return this.exec(`${this.npm} update ${this.category} ${pkg}@${version}`);
    }
}

export default new NpmManager();

