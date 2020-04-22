class Eventbus {
    constructor() {
        this._storage = {};
    }

    findIndex(arr, x) {
        return arr.findIndex((item)=>item.fn===x);
    };

    on(name, fn, scope) {
        if (Object.prototype.toString.call(this._storage[name]) === '[object Array]') {
            this._storage[name].push({scope, fn});
        } else {
            this._storage[name] = [{scope, fn}];
        }
    }

    once(name, fn, scope) {
        let self = this;
        let wrapFn = function(payload) {
            fn.call(scope, payload);

            self.off(name, wrapFn);
        };

        this.on(name, wrapFn, scope);
    }

    off(name, fn) {
        if (this._storage[name]) {
            let i = this.findIndex(this._storage[name], fn);

            if (i !==-1) this._storage[name].splice(i, 1);
        }
    }

    clear(name) {
        if (name) {
            this._storage[name] = [];
        } else {
            this._storage = {};
        }
        return this._storage;
    }

    emit(name, payload) {
        if (this._storage[name]) {
            this._storage[name].forEach((f)=>f.fn.call(f.scope, payload));
        }
    }
}

let eventbus = new Eventbus();


export {
    eventbus as default,
    eventbus,
    Eventbus,
};
