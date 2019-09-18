import {wxa as app} from '../../ts/wxa';


describe('app mount', ()=>{
    let warn = jest.fn();
    let log = jest.fn();
    let originConsole = global.console;
    global.App = jest.fn();
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
        app.launchApp({});
        expect(App.mock.calls.length).toBe(1);
        expect(App.mock.calls[0][0]).not.toBeFalsy();

        app.launchApp(class Empty {});
        expect(App.mock.calls.length).toBe(2);
        expect(App.mock.calls[1][0]).not.toBeFalsy();
    });

    test('mixin', ()=>{
        let com = {
            methods: {
                hello: jest.fn(),
                tap: jest.fn(),
            },
            onLoad: jest.fn(),
        };
        app.launchApp({
            mixins: [com],
            methods: {
                hello: jest.fn(),
            },
        });

        let instance = App.mock.calls[2][0];
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

    test('no methods in app', ()=>{
        const load = jest.fn();
        app.launchApp({
            onLoad: load,
            methods: null,
        });

        let instance = App.mock.calls[3][0];
        instance.onLoad();
        expect(load).toHaveBeenCalled();
    });

    test('copy prototype function to methods in app', ()=>{
        const load = jest.fn();

        class Main {
            load() {
                load();
            }
        }

        app.launchApp(Main);

        let instance = App.mock.calls[4][0];

        expect(instance.load).not.toBeFalsy();
        expect(instance.methods.load).not.toBeFalsy();

        instance.load();

        expect(load).toHaveBeenCalled();
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

//     global.App = jest.fn();
//     app.use(plugin, {text: 'hello'});

//     app.launchApp({});
//     let instance = App.mock.calls[0][0];
//     expect(instance.pluginMethod).not.toBeFalsy();
//     expect(instance.type).toBe('App');
//     expect(instance.text).toBe('hello');

//     instance.pluginMethod();
//     expect(instance.pluginMethod.mock.calls.length).toBe(1);
// });

// test('plugin throw error', ()=>{
//     let plugin = ()=>{
//         return ()=>{
//             throw new Error('heiheihei');
//         };
//     };
//     const error = jest.fn();

//     global.App = jest.fn();
//     global.console = {
//         error,
//     };

//     app.use(
//         plugin, {options: 'something useless'}
//     );

//     app.launchApp({});

//     expect(error).toHaveBeenCalled();
// });
