class Eventbus {
    constructor() {
        this.storage = {};
    }
    findIndex(arr, x) {
        return arr.findIndex((item)=>item===x);
    };

    on(name, fn) {
        if (Object.prototype.toString.call(this.storage[name]) === '[object Array]') {
            this.storage[name].push(fn);
        } else {
            this.storage[name] = [fn];
        }
    }

    off(name, fn) {
        if (this.storage[name]) {
            let i = this.findIndex(this.storage[name], fn);

            if (i !==-1) this.storage[name].splice(i, 1);
        }
    }

    clear(name) {
        if (name) {
            this.storage[name] = [];
        } else {
            this.storage = {};
        }
        return this.storage;
    }

    emit(name, payload) {
        if (this.storage[name]) {
            this.storage[name].forEach((f)=>f(payload));
        }
    }
}

let eventbus = new Eventbus();


export {
    eventbus as default,
    eventbus,
    Eventbus,
};
