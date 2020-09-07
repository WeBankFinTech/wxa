import {storage} from '@wxa/core';

export default {
    getItem(key) {
        return new Promise((r, rj)=>{
            r(storage.get(key));
        });
    },
    setItem(key, string) {
        return new Promise((r)=>{
            r(storage.set(key, string));
        });
    },
    removeItem(key) {
        return new Promise((r)=>r(storage.remove(key)));
    },
};
