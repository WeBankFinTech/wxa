import {
    default as Storage,
} from '../src/utils/storage';

test('storage', ()=>{
    let setStorageSync = jest.fn();
    let getStorageSync = jest.fn();
    let removeStorageSync = jest.fn();
    let clearStorageSync = jest.fn();

    global.wx = {
        setStorageSync,
        getStorageSync,
        removeStorageSync,
        clearStorageSync,
    };

    let storage = new Storage();

    storage.get();

    expect(getStorageSync).toHaveBeenCalled();

    storage.set('a', void(0));

    expect(setStorageSync).toHaveBeenCalled();

    storage.clear();

    expect(clearStorageSync).toHaveBeenCalled();

    storage.remove();

    expect(removeStorageSync).toHaveBeenCalled();
});
