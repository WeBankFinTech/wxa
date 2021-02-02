interface EventInter {
    ctx: string;
    fn: AnyFunction;
}

class Eventbus {
    private _storage: Record<string, EventInter[]>;

    constructor() {
        this._storage = {};
    }

    findIndex(arr: EventInter[], x: AnyFunction) {
        return arr.findIndex((item) => item.fn === x);
    }

    on(name: string, fn: AnyFunction, ctx?: string) {
        if (Object.prototype.toString.call(this._storage[name]) === '[object Array]') {
            this._storage[name].push({ctx, fn});
        } else {
            this._storage[name] = [{ctx, fn}];
        }
    }

    once(name: string, fn: AnyFunction, ctx?: string) {
        const self = this;
        const wrapFn: AnyFunction = (payload: any) => {
            fn.call(ctx, payload);

            self.off(name, wrapFn);
        };

        this.on(name, wrapFn, ctx);
    }

    off(name: string, fn: AnyFunction) {
        if (this._storage[name]) {
            const i = this.findIndex(this._storage[name], fn);

            if (i !== -1) this._storage[name].splice(i, 1);
        }
    }

    clear(name: string) {
        if (name) {
            this._storage[name] = [];
        } else {
            this._storage = {};
        }
        return this._storage;
    }

    emit(name: string, payload?: any) {
        if (this._storage[name]) {
            this._storage[name].forEach((f) => f.fn.call(f.ctx, payload));
        }
    }
}

const eventbus = new Eventbus();

export {
    eventbus as default,
    eventbus,
    Eventbus,
};
