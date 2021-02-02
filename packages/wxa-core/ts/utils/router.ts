import wxapi, {IWXAPromiseAPI} from './wxapi';
import {wxa} from '../wxa';

export default class Router {
    public wxapi: IWXAPromiseAPI;
    private $apiMap;

    constructor() {
        this.wxapi = wxapi(wx);

        this.$apiMap = new Map([
            ['push', this.wxapi.navigateTo],
            ['replace', this.wxapi.redirectTo],
            ['reLaunch', this.wxapi.reLaunch],
            ['switch', this.wxapi.switchTab],
        ]);

        this.$apiMap.forEach((fn: AnyFunction, name: string)=>{
            this[name] = (url: string, options = {})=> {
                const promise = fn.call(this, {url, ...options});
                this.preExec(url);

                return promise.catch((err: any)=>{
                    if (
                        err && err.errMsg &&
                        /fail[a-zA-Z\s]*can[a-zA-Z\s]*tabbarpage/i.test(err.errMsg.replace(/[\s\:]*/g, ''))
                    ) {
                        return this.wxapi.switchTab.call(this, {url, ...options});
                    } else {
                        return Promise.reject(err);
                    }
                });
            };
        });
    }

    get() {
        const stack = this.getAll();
        return stack[stack.length-1];
    }

    getAll() {
        return getCurrentPages();
    }

    preExec(url: string) {
        try {
            let path = url.replace(/^\//, '');
            const allPage = getCurrentPages();
            let route = allPage[allPage.length-1].route;
            // relative path
            if (path[0] === '.' && route) {
                let idx = 0;
                let stack = [];
                while (~['.', '/'].indexOf(path[idx]) && idx < path.length) {
                    stack.push(path[idx]);

                    const temp = stack.join('');
                    if (temp === './') {
                        route = route.replace(/[^\.\/]+$/, '');
                        stack = [];
                    } else if (temp === '../') {
                        route = route.replace(/[^\.\/]+\/[^\.\/]+\/?$/, '');
                        stack = [];
                    }

                    idx++;
                }

                path = route + path.slice(idx);
            }

            const vm = wxa.$$pageMap.get(path);
            wxa.IS_DEBUG && console.info(`[beforeRouteEnter] target route is ${path}`);
            wxa.IS_DEBUG && console.info(`[beforeRouteEnter] target route vm is %o`, vm);

            // ToDo: record time and give some tips to developers.
            if (vm && vm.beforeRouteEnter && typeof vm.beforeRouteEnter === 'function') {
                vm.beforeRouteEnter.call(vm, path, allPage[allPage.length-1].route);
            } else {
                wxa.IS_DEBUG && console.info('[beforeRouteEnter] script not find in target route');
            }
        } catch (e) {
            wxa.IS_DEBUG && console.error(e);
        }
    }

    go(len: number) {
        return this.wxapi.navigateBack({delta: Math.abs(len)});
    }

    goBack() {
        return this.go(-1);
    }

    close() {
        return this.wxapi.navigateBackMiniProgram();
    }
}

export const router = new Router();
