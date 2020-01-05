import {
    default as Storage,
} from '../src/utils/storage';
import {
    addNoPromiseApi,
} from '../src/utils/wxapi';

import 'jest-plugin-console-matchers/setup';

let origin = wx;
beforeAll(()=>{
    addNoPromiseApi('nextTick');
    wx = {
        setStorageSync() {
            throw new Error('test');
        },
        getStorageSync() {
            throw new Error('test');
        },
        removeStorageSync() {
            throw new Error('test');
        },
        clearStorageSync() {
            throw new Error('test');
        },
    };
});

afterAll(()=>{
    wx = origin;
});

describe('storage unitTester', ()=>{
    test('throw error', ()=>{
        const storage = new Storage(wx);

        expect(()=>storage.get()).toConsoleError();
        expect(()=>storage.set()).toConsoleError();
        expect(()=>storage.remove()).toConsoleError();
        expect(()=>storage.clear()).toConsoleError();
    });

    test('get info', ()=>{
        const wx1 = {
            getStorageSync() {
                return null;
            },
        };
        addNoPromiseApi([]); // 更新缓存
        const storage1 = new Storage(wx1);

        expect(storage1.get()).toBe(null);

        const wx2 = {
            getStorageSync() {
                return '';
            },
        };
        addNoPromiseApi([]); // 更新缓存
        const storage2 = new Storage(wx2);
        expect(storage2.get()).toBe(null);

        const wx3 = {
            getStorageSync() {
                return JSON.stringify('');
            },
        };
        addNoPromiseApi([]); // 更新缓存
        const storage3 = new Storage(wx3);
        expect(storage3.get()).toBe('');
    });

    test('storage success', ()=>{
        let setStorageSync = jest.fn();
        let getStorageSync = jest.fn();
        let removeStorageSync = jest.fn();
        let clearStorageSync = jest.fn();

        const wx = {
            setStorageSync,
            getStorageSync,
            removeStorageSync,
            clearStorageSync,
        };

        // 更新缓存
        addNoPromiseApi([]);
        let storage = new Storage(wx);

        storage.get();

        expect(getStorageSync).toHaveBeenCalled();

        storage.set('a', void(0));

        expect(setStorageSync).toHaveBeenCalled();

        storage.clear();

        expect(clearStorageSync).toHaveBeenCalled();

        storage.remove();

        expect(removeStorageSync).toHaveBeenCalled();
    });
});
