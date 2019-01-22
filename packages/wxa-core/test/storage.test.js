import {
    default as Storage,
} from '../src/utils/storage';

import 'jest-plugin-console-matchers/setup';

describe('storage unitTester', ()=>{
    test('throw error', ()=>{
        const wx = {
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

        const storage1 = new Storage(wx1);

        expect(storage1.get()).toBe(null);

        const wx2 = {
            getStorageSync() {
                return '';
            },
        };
        const storage2 = new Storage(wx2);
        expect(storage2.get()).toBe(null);

        const wx3 = {
            getStorageSync() {
                return JSON.stringify('');
            },
        };
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
