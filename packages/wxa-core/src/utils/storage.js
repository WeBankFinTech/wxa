import wxapi from './wxapi';

export default class Storage {
    constructor(wx) {
        this.wxapi = wxapi(wx);
    }
    set(key, value) {
        let ret = true;
        try {
            this.wxapi.setStorageSync(key, JSON.stringify(value));
        } catch (e) {
            console.error(e);
            ret = false;
        }
        return ret;
    }
    get(key) {
        let ret;
        try {
            ret = this.wxapi.getStorageSync(key);
            ret = (ret === ''|| ret == null) ? null : JSON.parse(ret);
        } catch (e) {
            console.error(e);
        }

        return ret;
    }
    remove(key) {
        try {
            this.wxapi.removeStorageSync(key);
        } catch (e) {
            console.error(e);
        }
    }
    clear() {
        try {
            this.wxapi.clearStorageSync();
        } catch (e) {
            console.error(e);
        }
    }
}

export const storage = new Storage(wx);
