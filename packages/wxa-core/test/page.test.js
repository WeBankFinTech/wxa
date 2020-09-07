import {wxa as page} from '../src/wxa';
import debounce from 'lodash/debounce';
jest.mock('lodash/debounce', () => jest.fn(fn => fn));

jest.useFakeTimers();

describe('page mount', ()=>{
    let warn = jest.fn();
    let log = jest.fn();
    let originConsole = global.console;
    global.Page = jest.fn();
    global.console = {
        warn: function(e) {
            originConsole.warn(e);
            warn(e);
        },
        log: function(e) {
            originConsole.warn(e);
            log(e);
        },
    };

    test('empty obj', ()=>{
        page.launchPage({});
        expect(Page.mock.calls.length).toBe(1);
        expect(Page.mock.calls[0][0]).not.toBeFalsy();

        page.launchPage(class Empty {});
        expect(Page.mock.calls.length).toBe(2);
        expect(Page.mock.calls[1][0]).not.toBeFalsy();
    });

    test('empty obj with $go',  ()=>{
        jest.useFakeTimers();
        page.launchPage({});

        let instance = Page.mock.calls[2][0];
        let e = {currentTarget: {dataset: {path: '/pages/index/index'}}};

        instance.$go(e);
        expect(warn.mock.calls.length).toBe(1);

        instance.$router = {
            push: jest.fn(),
            replace: jest.fn(),
        };

        instance.$go(e);
        expect(instance.$router.push.mock.calls.length).toBe(1);
        expect(instance.$router.push.mock.calls[0][0]).toBe('/pages/index/index');

        let e2 = {currentTarget: {dataset: {path: '/pages/index/index', type: 'replace'}}};

        instance.$go(e2);
        expect(instance.$router.replace.mock.calls.length).toBe(1);

    });

    test('empty obj should not with shareMessage', ()=>{
        page.launchPage({});

        let instance = Page.mock.calls[3][0];
        expect(instance.onShareAppMessage).toBeFalsy();
    });

    test('mixin', ()=>{
        let com = {
            methods: {
                hello: jest.fn(),
                tap: jest.fn(),
            },
            onLoad: jest.fn(),
        };
        page.launchPage({
            mixins: [com],
            methods: {
                hello: jest.fn(),
            },

        });

        let instance = Page.mock.calls[4][0];
        expect(instance.tap).not.toBeFalsy();
        expect(instance.hello).not.toBeFalsy();
        expect(instance.onLoad).not.toBeFalsy();

        instance.hello();
        expect(com.methods.hello.mock.calls.length).toBe(0);
        instance.tap();
        expect(com.methods.tap.mock.calls.length).toBe(1);
        instance.onLoad();
        expect(com.onLoad.mock.calls.length).toBe(1);
    });

    // 5
    test('copy prototype function to methods in page', ()=>{
        const load1 = jest.fn();
        const load2 = jest.fn();

        class Index {
            load() {
                load1();
            }
            methods = {
                load() {
                    load2();
                },
            }
        }

        page.launchPage(Index);

        let instance = Page.mock.calls[5][0];

        expect(instance.load).not.toBeFalsy();
        expect(instance.methods.load).not.toBeFalsy();

        instance.load();

        expect(load1).toHaveBeenCalled();
    });
});

// test('use plugin', ()=>{
//     let plugin = function(options, type) {
//         return function(vm) {
//             vm.pluginMethod = jest.fn();
//             vm.type = type;
//             vm.text = options.text;
//         };
//     };
//     // test('mount plugin')
//     global.Page = jest.fn();
//     page.use(plugin, {text: 'hello'});

//     page.launchPage({});
//     let instance = Page.mock.calls[0][0];
//     expect(instance.pluginMethod).not.toBeFalsy();
//     expect(instance.type).toBe('Page');
//     expect(instance.text).toBe('hello');

//     instance.pluginMethod();
//     expect(instance.pluginMethod.mock.calls.length).toBe(1);
// });
