const Global = 'global';
export class SessionStorage {
    constructor() {
        let _store = new Map();
        this._scope = new Map();
        this._scope.set(Global, _store);
    }

    set(key, value, scope = Global) {
        if (!this._scope.has(scope)) this._scope.set(scope, new Map());

        let store = this._scope.get(scope);
        store.set(key, value);
    }

    get(key, scope = Global) {
        if (!this._scope.has(scope)) return null;

        let store = this._scope.get(scope);
        return store.get(key);
    }

    remove(key, scope = Global) {
        if (!this._scope.has(scope)) return null;

        let store = this._scope.get(scope);
        store.delete(key);
    }

    clear(scope = Global) {
        if (scope === '*') this._scope.clear();

        if (!this._scope.has(scope)) return void(0);

        let store = this._scope.get(scope);
        store.clear();
    }
}

export const sessionStorage = new SessionStorage();

