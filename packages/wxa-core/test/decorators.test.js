global.getApp = function() {
    return {};
};
global.getCurrentPages = function() {
    return [{}];
};

jest.useFakeTimers();


import {
    Router,
    Eventbus,
    Wxapi,
    Storage,
    Utils,
    Fetch,
    Page,
    App,

    Deprecate,
    Time,
    Debounce,
    Throttle,
    Once,
    Delay,
    Lock,

    Loading,

    Mixins,
} from '../src/decorators/index';

describe('wxa decorator', ()=>{
    test('mount eventbus to class', ()=>{
        @Eventbus
        class T {}
        let i = new T();

        expect(i.$eventbus).not.toBeFalsy();
    });

    test('mount wxapi', ()=>{
        @Wxapi
        class T {};

        expect(new T().$wxapi).not.toBeFalsy();
    });

    test('mount storage', ()=>{
        @Storage
        class T {};

        expect(new T().$storage).not.toBeFalsy();
    });

    test('mount fetch', ()=>{
        @Fetch
        class T {};

        expect(new T().$fetch).not.toBeFalsy();
    });

    test('mount Utils', ()=>{
        @Utils
        class T {};

        expect(new T().$utils).not.toBeFalsy();
        expect(new T().$utils.formatDate).not.toBeFalsy();
        expect(new T().$utils.trim).not.toBeFalsy();
    });

    test('mount router to class', ()=>{
        @Router
        class T {}
        let i = new T();

        expect(i.$router.push).not.toBeFalsy();
        expect(i.$router.replace).not.toBeFalsy();
        expect(i.$router.get).not.toBeFalsy();
        expect(i.$router.reLaunch).not.toBeFalsy();
        expect(i.$router.switch).not.toBeFalsy();
        expect(i.$router.go).not.toBeFalsy();
        expect(i.$router.goBack).not.toBeFalsy();
    });

    test('mount page', ()=>{
        @Page
        class T {}

        let i = new T();
        expect(i.$utils).not.toBeFalsy();
        expect(i.$storage).not.toBeFalsy();
        expect(i.$eventbus).not.toBeFalsy();
        expect(i.$wxapi).not.toBeFalsy();
        expect(i.$router).not.toBeFalsy();
        // expect(i.$app).not.toBeFalsy();
        expect(i.$fetch).not.toBeFalsy();
    });

    test('mount app', ()=>{
        @App
        class T {}

        let i = new T();
        expect(i.$utils).not.toBeFalsy();
        expect(i.$storage).not.toBeFalsy();
        expect(i.$eventbus).not.toBeFalsy();
        expect(i.$wxapi).not.toBeFalsy();
        expect(i.$router).not.toBeFalsy();
        expect(i.$fetch).not.toBeFalsy();
    });
});

let originConsole = console;


describe('lodash decorators', ()=>{
    test('deprecate decorator', ()=>{
        let warn = jest.fn();
        global.console.warn = warn;

        class T {
            @Deprecate
            foo() {}
        }

        new T().foo();

        expect(warn).toHaveBeenCalled();
    });

    test('debounce function', ()=>{
        let counter1 = jest.fn();
        let counter2 = jest.fn();

        let {descriptor: {value: dc1}} = Debounce()({descriptor: {value: ()=>counter1()}});

        let {descriptor: {value: dc2}} = Debounce(1000)({descriptor: {value: ()=>counter2()}});

        dc1();
        dc1();
        dc1();

        expect(counter1).toHaveBeenCalledTimes(1);

        dc2();
        dc2();
        dc2();
        expect(counter2).toHaveBeenCalledTimes(1);
    });

    test('Time function', async ()=>{
        let time = jest.fn();
        let timeEnd = jest.fn();

        global.console = {
            time,
            timeEnd,
        };

        class T {
            @Time
            foo() {
                return Promise.resolve();
            }

            @Time('boo')
            boo() {

            }

            @Time
            too() {

            }

            @Time
            poo() {
                return Promise.reject();
            }
        }

        await new T().foo();

        expect(time).toHaveBeenCalled();
        expect(timeEnd).toHaveBeenCalled();

        new T().boo();
        expect(time).toHaveBeenCalledTimes(2);
        expect(timeEnd).toHaveBeenCalledTimes(2);

        new T().too();
        expect(time).toHaveBeenCalledTimes(3);
        expect(timeEnd).toHaveBeenCalledTimes(3);

        await new T().poo().catch(()=>{});
        expect(time).toHaveBeenCalledTimes(4);
        expect(timeEnd).toHaveBeenCalledTimes(4);
    });

    test('throttle function', ()=>{
        let c1 = jest.fn();
        let c2 = jest.fn();

        global.console = originConsole;

        class T {
            @Throttle()
            foo() {
                c1();
            }

            @Throttle(2000)
            boo() {
                c2();
            }
        }

        let i = new T();

        i.foo();
        expect(c1).toHaveBeenCalled();

        i.foo();
        i.foo();
        expect(c1).toHaveBeenCalledTimes(1);

        // jest.runOnlyPendingTimers(1500);
        // i.foo();
        // // jest.runAllTimers();
        // expect(c1).toHaveBeenCalledTimes(2);


        i.boo();
        i.boo();
        expect(c2).toHaveBeenCalled();

        i.boo();

        jest.advanceTimersByTime(2000);

        expect(c2).toHaveBeenCalledTimes(1);
    });

    test('Once', ()=>{
        class T {
            @Once
            foo() {
                return {};
            }
        }

        let i = new T();

        expect(i.foo()).toBe(i.foo());
    });

    test('Delay', ()=>{
        let flag;
        let fn = jest.fn();
        class T {
            @Delay(1000)
            foo(x) {
                flag = x;
                fn();
            }
        }

        let i = new T();

        i.foo('test');

        expect(fn).not.toHaveBeenCalled();

        jest.advanceTimersByTime(1000);

        expect(fn).toHaveBeenCalled();
        expect(flag).toBe('test');
    });

    test('Lock', async ()=>{
        let c1 = jest.fn();
        let c2 = jest.fn();

        let c3 = jest.fn();

        class T {
            @Lock
             foo() {
                let f = ()=>Promise.resolve();
                c1();
                return f();
            }

            @Lock
             reject() {
                let f = ()=>Promise.reject();
                c3();
                return f();
            }

            @Lock
             boo() {
                let f = ()=>{
                    return new Promise((resolve, reject)=>{
                        setTimeout(()=>{
                            resolve();
                        }, 1000);
                    });
                };

                c2();
                return f();
            }

            @Lock
            poo() {
                return 1;
            }
        }

        let instance = new T();

        instance.foo();
        instance.foo();
        instance.foo();
        instance.foo();
        expect(c1).toHaveBeenCalledTimes(1);

        jest.advanceTimersByTime(100);


        process.nextTick(()=>{
            instance.foo();
            expect(c1).toHaveBeenCalledTimes(2);
        });


        instance.boo();
        instance.boo();
        instance.boo();

        expect(c2).toHaveBeenCalledTimes(1);

        jest.advanceTimersByTime(1000);

        process.nextTick(()=>{
            instance.boo();
            expect(c2).toHaveBeenCalledTimes(2);
        });

        expect(instance.poo()).toBe(1);


        expect(instance.reject().catch(()=>{}).then).not.toBeFalsy();
        expect(c3).toHaveBeenCalledTimes(1);
    });
});

describe('loading Decorators', ()=>{
    let showLoading = jest.fn();
    let showNavigationBarLoading = jest.fn();
    let hideLoading = jest.fn();
    let hideNavigationBarLoading = jest.fn();

    wx.showLoading = showLoading;
    wx.showNavigationBarLoading = showNavigationBarLoading;
    wx.hideLoading = hideLoading;
    wx.hideNavigationBarLoading = hideNavigationBarLoading;

    test('1. loading', ()=>{
        let {descriptor: {value: dc1}} = Loading()({descriptor: {value: ()=>{}}});

        dc1();
        expect(showLoading).toHaveBeenCalledTimes(1);
        expect(hideLoading).toHaveBeenCalledTimes(1);

        let {descriptor: {value: dc2}} = Loading(void(0), 'bar')({descriptor: {value: ()=>{}}});
        dc2();
        expect(showNavigationBarLoading).toHaveBeenCalledTimes(1);
        expect(hideNavigationBarLoading).toHaveBeenCalledTimes(1);
    });

    test('2. promise loading', async ()=>{
        let {descriptor: {value: dc1}} = Loading()({descriptor: {value: ()=>Promise.resolve()}});

        await dc1();

        expect(showLoading).toHaveBeenCalledTimes(2);
        expect(hideLoading).toHaveBeenCalledTimes(2);

        let {descriptor: {value: dc2}} = Loading(void(0), 'bar')({descriptor: {value: ()=>Promise.resolve()}});

        await dc2();
        expect(showNavigationBarLoading).toHaveBeenCalledTimes(2);
        expect(hideNavigationBarLoading).toHaveBeenCalledTimes(2);
    });

    test('3. reject promise loading', async ()=>{
        let {descriptor: {value: dc1}} = Loading()({descriptor: {value: ()=>Promise.reject()}});

        await dc1();

        expect(showLoading).toHaveBeenCalledTimes(3);
        expect(hideLoading).toHaveBeenCalledTimes(3);

        let {descriptor: {value: dc2}} = Loading(void(0), 'bar')({descriptor: {value: ()=>Promise.reject()}});

        await dc2();
        expect(showNavigationBarLoading).toHaveBeenCalledTimes(3);
        expect(hideNavigationBarLoading).toHaveBeenCalledTimes(3);
    });
});

describe('mixins decorators', ()=>{
    test('merge data and method', ()=>{
        let common = {
            data: {
                a: 1,
                c: 3,
            },
            methods: {
                test: jest.fn(),
                test2: jest.fn(),
            },
        };

        @Mixins(common)
        class Vm {
            data = {
                a: 2,
                b: 2,
            }
            methods= {
                test: jest.fn(),
            }
        };

        let dvm = new Vm();

        expect(dvm.mixins).toMatchObject([{
            data: {
                a: 1,
                c: 3,
            },
            methods: {
                test: expect.any(Function),
                test2: expect.any(Function),
            },
        }]);
    });
});
