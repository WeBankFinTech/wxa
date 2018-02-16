import component from '../src/base/component';


describe('component', ()=>{
    global.Component = jest.fn();
    test('empty com', ()=>{
        component.launch({});
        expect(Component).toHaveBeenCalled();
        expect(Component.mock.calls[0][0]).not.toBeFalsy();

        component.launch(class com {});
        expect(Component).toHaveBeenCalledTimes(2);
        expect(Component.mock.calls[1][0]).not.toBeFalsy();
    });

    test('copy methods', ()=>{
        let hello = jest.fn();
        let outer = jest.fn();
        component.launch({
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
        component.launch({
            created,
        });

        let instance = Component.mock.calls[3][0];
        instance.created();
        expect(created).toHaveBeenCalled();
    });
});

test('use plugin', ()=>{
    let plugin = function(options, type) {
        return function(vm) {
            vm.pluginMethod = jest.fn();
            vm.type = type;
            vm.text = options.text;
        };
    };

    global.Component = jest.fn();
    component.use(plugin, {text: 'hello'});

    component.launch({});
    let instance = Component.mock.calls[0][0];
    expect(instance.pluginMethod).not.toBeFalsy();
    expect(instance.type).toBe('Component');
    expect(instance.text).toBe('hello');

    instance.pluginMethod();
    expect(instance.pluginMethod.mock.calls.length).toBe(1);
});
