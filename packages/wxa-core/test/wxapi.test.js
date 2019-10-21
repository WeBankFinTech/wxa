import {
    default as wxapi,
    addNoPromiseApi,
} from '../src/utils/wxapi';

let originWx = wx;
beforeAll(()=>{
    // 更新缓存

    addNoPromiseApi('nextTick');

    wx = {
        getSystemInfo(opt) {
            setTimeout(()=>opt.success());
        },
        getSomething(opt) {
            setTimeout(()=>opt.success());
        },
        getSystemInfoSync() {

        },
        getUpdateManager() {

        },
        onNetworkStatusChange() {

        },
        nextTick() {

        },
    };
});

afterAll(()=>{
    wx = originWx;
});


describe('wxapi', ()=>{
    test('sync api', ()=>{
        let w = wxapi(wx);

        expect(w.getSystemInfoSync()).toBeFalsy();
        expect(w.getUpdateManager()).toBeFalsy();
        expect(w.onNetworkStatusChange()).toBeFalsy();
        expect(w.nextTick()).toBeFalsy();
    });

    test('async api', ()=>{
        let w = wxapi(wx);

        expect(w.getSystemInfo().then).not.toBeFalsy();
    });

    test('addNoPromiseApi', ()=>{
        addNoPromiseApi('getSystemInfo');
        let w = wxapi(wx);

        expect(w.getSystemInfo()).toBeFalsy();
    });

    test('addNoPromiseApi with arrow', ()=>{
        addNoPromiseApi(['getSystemInfo', 'getSomething']);
        let w = wxapi(wx);

        expect(w.getSystemInfo()).toBeFalsy();
        expect(w.getSomething()).toBeFalsy();
    });

    test('addNoPromiseApi with sp', ()=>{
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
