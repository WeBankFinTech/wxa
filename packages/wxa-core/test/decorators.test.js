global.getApp = function() {
    return {};
};
global.getCurrentPages = function() {
    return [{}];
};

import {
    GetApp,
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
} from '../src/utils/decorators';

describe('wxa decorator', ()=>{
    test('mount app to class', ()=>{
        @GetApp
        class T {}
        let i = new T();

        expect(i.app).not.toBeFalsy();
    });

    test('mount eventbus to class', ()=>{
        @Eventbus
        class T {}
        let i = new T();

        expect(i.eventbus).not.toBeFalsy();
    });

    test('mount wxapi', ()=>{
        @Wxapi
        class T {};

        expect(new T().wxapi).not.toBeFalsy();
    });

    test('mount storage', ()=>{
        @Storage
        class T {};

        expect(new T().storage).not.toBeFalsy();
    });

    test('mount fetch', ()=>{
        @Fetch
        class T {};

        expect(new T().fetch).not.toBeFalsy();
    });

    test('mount Utils', ()=>{
        @Utils
        class T {};

        expect(new T().utils).not.toBeFalsy();
        expect(new T().utils.formatDate).not.toBeFalsy();
        expect(new T().utils.trim).not.toBeFalsy();
    });

    test('mount router to class', ()=>{
        @Router
        class T {}
        let i = new T();

        expect(i.router.push).not.toBeFalsy();
        expect(i.router.replace).not.toBeFalsy();
        expect(i.router.get).not.toBeFalsy();
        expect(i.router.reLaunch).not.toBeFalsy();
        expect(i.router.switch).not.toBeFalsy();
        expect(i.router.go).not.toBeFalsy();
        expect(i.router.goBack).not.toBeFalsy();
        expect(i.router.close).not.toBeFalsy();
    });

    test('mount page', ()=>{
        @Page
        class T {}

        let i = new T();
        expect(i.utils).not.toBeFalsy();
        expect(i.storage).not.toBeFalsy();
        expect(i.eventbus).not.toBeFalsy();
        expect(i.wxapi).not.toBeFalsy();
        expect(i.router).not.toBeFalsy();
        expect(i.app).not.toBeFalsy();
        expect(i.fetch).not.toBeFalsy();
    });

    test('mount app', ()=>{
        @App
        class T {}

        let i = new T();
        expect(i.utils).not.toBeFalsy();
        expect(i.storage).not.toBeFalsy();
        expect(i.eventbus).not.toBeFalsy();
        expect(i.wxapi).not.toBeFalsy();
        expect(i.router).not.toBeFalsy();
        expect(i.fetch).not.toBeFalsy();
    });
});

let originConsole = console;

jest.useFakeTimers();

describe('lodash decorators', ()=>{
    test('deprecate decorator', ()=>{
        let warn = jest.fn();
        global.console = {
            warn,
        };

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
        class T {
            @Debounce()
            foo() {
                counter1();
            }

            @Debounce(1000)
            boo() {
                counter2();
            }
        }

        let i = new T();
        i.foo();
        i.foo();
        i.foo();

        expect(counter1).toHaveBeenCalledTimes(0);

        jest.runAllTimers();
        expect(counter1).toHaveBeenCalledTimes(1);

        i.foo();
        jest.runAllTimers();
        i.foo();
        expect(counter1).toHaveBeenCalledTimes(2);

        i.boo();
        i.boo();
        i.boo();
        expect(counter2).toHaveBeenCalledTimes(0);
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

        jest.advanceTimersByTime(1000);
        i.foo();
        expect(c1).toHaveBeenCalledTimes(1);

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
            async foo() {
                let f = ()=>Promise.resolve();
                c1();
                return await f();
            }

            @Lock
            async reject() {
                let f = ()=>Promise.reject();
                c3();
                return await f();
            }

            @Lock
            async boo() {
                let f = ()=>{
                    return new Promise((resolve, reject)=>{
                        setTimeout(()=>{
                            resolve();
                        }, 1000);
                    });
                };

                c2();
                return await f();
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
