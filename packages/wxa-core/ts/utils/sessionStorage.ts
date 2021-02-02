const Global = 'global';

export class SessionStorage {
    public _scope: any;

    constructor() {
        const _store = new Map();
        this._scope = new Map();
        this._scope.set(Global, _store);
    }

    set(key: string, value: any, scope = Global) {
        if (!this._scope.has(scope)) this._scope.set(scope, new Map());

        const store = this._scope.get(scope);
        store.set(key, value);
    }

    get(key: string, scope = Global) {
        if (!this._scope.has(scope)) return null;

        const store = this._scope.get(scope);
        return store.get(key);
    }

    remove(key: string, scope = Global) {
        if (!this._scope.has(scope)) return null;

        const store = this._scope.get(scope);
        store.delete(key);
    }

    clear(scope = Global) {
        if (scope === '*') this._scope.clear();

        if (!this._scope.has(scope)) return void(0);

        const store = this._scope.get(scope);
        store.clear();
    }
}

export const sessionStorage = new SessionStorage();

