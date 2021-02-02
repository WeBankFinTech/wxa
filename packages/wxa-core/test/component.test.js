import {wxa as com} from '../ts/wxa';


describe('component', ()=>{
    global.Component = jest.fn();
    test('empty com', ()=>{
        com.launchComponent({});
        expect(Component).toHaveBeenCalled();
        expect(Component.mock.calls[0][0]).not.toBeFalsy();

        com.launchComponent(class com {});
        expect(Component).toHaveBeenCalledTimes(2);
        expect(Component.mock.calls[1][0]).not.toBeFalsy();
    });

    test('copy methods', ()=>{
        let hello = jest.fn();
        let outer = jest.fn();
        com.launchComponent({
            methods: {
                hello,
            },
            outer,
        });

        let instance = Component.mock.calls[2][0];
        expect(instance.hello).toBeFalsy();

        instance.created();
        expect(instance.hello).not.toBeFalsy();
        instance.hello();
        expect(hello).toHaveBeenCalled();
    });

    test('merge created', ()=>{
        let created = jest.fn();
        com.launchComponent({
            created,
        });

        let instance = Component.mock.calls[3][0];
        instance.created();
        expect(created).toHaveBeenCalled();
    });

    // 4
    test('copy prototype function to methods in Component', ()=>{
        const load1 = jest.fn();
        const load2 = jest.fn();

        class Com {
            load() {
                load1();
            }
            methods = {
                load() {
                    load2();
                },
                abc: 1,
            }
        }

        com.launchComponent(Com);

        let instance = Component.mock.calls[4][0];

        instance.created();

        expect(instance.load).not.toBeFalsy();
        expect(instance.methods.load).not.toBeFalsy();
        expect(instance.abc).toBe(1);

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

//     global.Component = jest.fn();
//     component.use(plugin, {text: 'hello'});

//     com.launchComponent({});
//     let instance = Component.mock.calls[0][0];
//     expect(instance.pluginMethod).not.toBeFalsy();
//     expect(instance.type).toBe('Component');
//     expect(instance.text).toBe('hello');

//     instance.pluginMethod();
//     expect(instance.pluginMethod.mock.calls.length).toBe(1);
// });
