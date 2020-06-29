import {
    SessionStorage,
} from '../src/utils/sessionStorage';

import 'jest-plugin-console-matchers/setup';

describe('Session Storage', () => {
    let map = new Map([]);
    let val = {type: 'navigate', value: 'pages/index'};
    let key = 'APP_REDIRECT';

    test('Basic Usage', ()=>{
        let store = new SessionStorage();

        store.set(key, val);
        expect(store.get(key)).toBe(val);

        store.set(key + key, map);
        expect(store.get(key + key)).toBe(map);

        store.remove(key);
        expect(store.get(key)).toBeFalsy();

        store.set(key, val);
        store.clear();
        expect(store.get(key)).toBeFalsy();
        expect(store.get(key + key)).toBeFalsy();
    });

    test('with scope', () => {
        let store = new SessionStorage();

        store.set(key, val, 'app');

        expect(store.get(key)).toBeFalsy();
        expect(store.get(key, 'app')).toBe(val);

        store.remove(key, 'app');
        expect(store.get(key, 'app')).toBeFalsy();

        expect(store._scope.get('app')).not.toBeFalsy();

        store.clear('*');
        expect(store._scope.get('app')).toBeFalsy();
    });
});
