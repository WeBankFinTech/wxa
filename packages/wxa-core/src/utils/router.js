import wxapi from './wxapi';
import {wxa} from '../wxa';

export default class Router {
    constructor() {
        this.wxapi = wxapi(wx);

        this.$apiMap = new Map([
            ['push', this.wxapi.navigateTo],
            ['replace', this.wxapi.redirectTo],
            ['reLaunch', this.wxapi.reLaunch],
            ['switch', this.wxapi.switchTab],
        ]);

        this.$apiMap.forEach((fn, name)=>{
            this[name] = (url)=> {
                this.preExec(url);
                return fn.call(this, {url});
            };
        });
    }

    get() {
        let stack = this.getAll();
        return stack[stack.length-1];
    }

    getAll() {
        return getCurrentPages();
    }

    preExec(url) {
        try {
            let path = url.replace(/^\//, '');
            let vm = wxa.$$pageMap.get(path);
            wxa.IS_DEBUG && console.info(`[Pre-Execute] target route is ${path}`);
            wxa.IS_DEBUG && console.info(`[Pre-Execute] target route vm is %o`, vm);

            // ToDo: record time and give some tips to developers.
            if (vm && vm.$preExec && typeof vm.$preExec === 'object') {
                Object.keys(vm.$preExec).forEach((name)=>vm.$preExec[name].call(null));
            } else {
                wxa.IS_DEBUG && console.info('[Pre-Execute] script not find in target route');
            }
        } catch (e) {
            wxa.IS_DEBUG && console.error(e);
        }
    }

    go(len) {
        return this.wxapi.navigateBack({delta: Math.abs(len)});
    }

    goBack() {
        return this.go(-1);
    }
}

export const router = new Router();
