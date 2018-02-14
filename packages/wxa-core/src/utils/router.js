import wxapi from './wxapi';

export default class Router {
    constructor(wxapi) {
        this.wxapi = wxapi;
    }

    get() {
        let stack = this.getAll();
        return stack[stack.length-1];
    }

    getAll() {
        return getCurrentPages();
    }

    push(url) {
        return this.wxapi.navigateTo({url});
    }

    replace(url) {
        return this.wxapi.redirectTo({url});
    }

    reLaunch(url) {
        return this.wxapi.reLaunch({url});
    }

    switch(url) {
        return this.wxapi.switchTab({url});
    }

    go(len) {
        return this.wxapi.navigateBack({delta: Math.abs(len)});
    }

    close() {
        return this.wxapi.navigateBack({delta: Math.abs(getCurrentPages().length)});
    }
}

export const router = new Router(wxapi);
