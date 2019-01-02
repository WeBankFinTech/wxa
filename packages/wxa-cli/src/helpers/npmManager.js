import {exec} from 'child_process';

export class NpmManager {
    constructor(manager='npm') {
        this.category = '-D';

        this.npm = manager;
        // test if dependency manager is npm-like, such as cnpm, wnpm, tnpm
        this.isNpmLike = /npm/.test(manager);
        this.isYarn = /yarn/.test(manager);
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
        if (this.isNpmLike) {
            return this.exec(`${this.npm} install ${this.category} ${pkg}@${version}`);
        } else if (this.isYarn) {
            return this.exec(`${this.npm} add ${pkg}@${version} ${this.category}`);
        } else {
            return Promise.reject('Dependency Manager only support npm, npm-like or yarn.');
        }
    }

    uninstall(pkg) {
        if (this.isNpmLike) {
            return this.exec(`${this.npm} uninstall ${this.category} ${pkg}`);
        } else if (this.isYarn) {
            return this.exec(`${this.npm} remove ${pkg}`);
        } else {
            return Promise.reject('Dependency Manager only support npm, npm-like or yarn.');
        }
    }

    update(pkg, version='latest') {
        if (this.isNpmLike) {
            return this.exec(`${this.npm} update ${this.category} ${pkg}@${version}`);
        } else if (this.isYarn) {
            return this.exec(`${this.npm} upgrade ${this.category} ${pkg}@${version}`);
        } else {
            return Promise.reject('Dependency Manager only support npm, npm-like or yarn.');
        }
    }
}

export default new NpmManager();

