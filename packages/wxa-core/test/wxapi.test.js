import {
    default as wxapi,
    addNoPromiseApi,
} from '../src/utils/wxapi';

describe('wxapi', ()=>{
    test('sync api', ()=>{
        wx = {
            ...wx,
            getSystemInfoSync() {

            },
            getUpdateManager() {

            },
            onNetworkStatusChange() {

            },
            nextTick() {

            },
        };

        let w = wxapi(wx);

        expect(w.getSystemInfoSync()).toBeFalsy();
        expect(w.getUpdateManager()).toBeFalsy();
        expect(w.onNetworkStatusChange()).toBeFalsy();
        expect(w.nextTick()).toBeFalsy();
    });

    test('async api', ()=>{
        wx = {
            ...wx,
            getSystemInfo(opt) {
                setTimeout(()=>opt.success());
            },
        };

        let w = wxapi(wx);

        expect(w.getSystemInfo().then).not.toBeFalsy();
    });

    test('addNoPromiseApi', ()=>{
        wx = {
            ...wx,
            getSystemInfo(opt) {
                setTimeout(()=>opt.success());
            },
        };

        addNoPromiseApi('getSystemInfo');
        let w = wxapi(wx);

        expect(w.getSystemInfo()).toBeFalsy();
    });

    test('addNoPromiseApi with arrow', ()=>{
        wx = {
            ...wx,
            getSystemInfo(opt) {
                setTimeout(()=>opt.success());
            },
            getSomething(opt) {
                setTimeout(()=>opt.success());
            },
        };

        addNoPromiseApi(['getSystemInfo', 'getSomething']);
        let w = wxapi(wx);

        expect(w.getSystemInfo()).toBeFalsy();
        expect(w.getSomething()).toBeFalsy();
    });

    test('addNoPromiseApi with sp', ()=>{
        wx = {
            ...wx,
            getSystemInfo(opt) {
                setTimeout(()=>opt.success());
            },
            getSomething(opt) {
                setTimeout(()=>opt.success());
            },
        };

        let r1 = addNoPromiseApi();
        let r2 = addNoPromiseApi(null);
        let r3 = addNoPromiseApi({});

        expect(r2).toBeFalsy();
        expect(r3).toBeFalsy();
        expect(r1).toBeFalsy();
    });

    test('singleton', ()=>{
        expect(wxapi(wx)).toBe(wxapi(wx));
    });
});
