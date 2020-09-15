import watchPlugin from '../src/index'

describe('watch plugin', ()=>{
    let watchFn = watchPlugin();

    test('not work with App or Component', ()=>{
        let mock = jest.fn();

        let vm = {
            watch: {
                'a': mock
            }
        };

        // test started.
        watchFn(vm, 'App');
    
        expect(mock).not.toBeCalled();

        watchFn(vm, 'Component');

        expect(mock).not.toBeCalled();
    })

    test('mount watch plugin', ()=>{
        let mock = jest.fn();

        let vm = {
            data: {a: 1},
            watch : {a(){}},
            onLoad: mock
        }

        // test started.
        watchFn(vm, 'Page');
        expect(mock).not.toBeCalled();
        
        vm.onLoad();
        expect(mock).toBeCalled();
        
        vm.onUnload();
    })

    test('watch page data', async()=>{
        let mock = jest.fn();

        let vm = {
            data: {
                a: 1,
                b: {c: 2},
                d: [1]
            },
            watch : {
                a: mock,
                'b.c': mock,
                'd[0]': mock,
                'b.d.c': mock
            },
        }

        // test started.
        watchFn(vm, 'Page');
        expect(mock).not.toBeCalled();
        
        vm.onLoad.call(vm);
        
        vm.data.a = 2;
        await new Promise((resolve)=>setTimeout(resolve));
        expect(mock).toBeCalled();
        
        vm.data.b.c = 3;
        await new Promise((resolve)=>setTimeout(resolve));
        expect(mock).toBeCalledTimes(2);

        vm.data.b.d = 'x';
        await new Promise((resolve)=>setTimeout(resolve));
        expect(mock).toBeCalledTimes(2);
        
        vm.data.d[0] = 0;
        await new Promise((resolve)=>setTimeout(resolve));
        expect(mock).toBeCalledTimes(2);
        
        vm.data.d = vm.data.d.splice(0, 1, 0);
        await new Promise((resolve)=>setTimeout(resolve));
        expect(mock).toBeCalledTimes(3);
    })

    test('computed page data', async () => {
        let mock = jest.fn();

        let vm = {
            data: {
                a: 1,
                b: {c: 2},
                d: [1]
            },
            computed: {
                computedA() {
                    console.log('------computed')
                    return this.data.a;
                }
            }
        }

        vm.setData = function(data) {
            this.data = {...data, ...this.data};
            mock(data);
        }
        watchFn(vm, 'Page');
        
        vm.onLoad.call(vm);

        expect(vm.data.computedA).toBe(1);
        expect(vm.$$WXAWatcher.length).toBe(1);
    })

    test('watch component data', async () => {
        let mock = jest.fn();

        let vm = {
            data: {
                a: 1,
                b: {c: 2},
                d: [1]
            },
            watch : {
                a: mock,
                'b.c': mock,
                'd[0]': mock,
                'b.d.c': mock
            },
        }

        // test started.
        watchFn(vm, 'Component');
        expect(mock).not.toBeCalled();
        
        vm.lifetimes.attached.call(vm);
        
        vm.data.a = 2;
        await new Promise((resolve)=>setTimeout(resolve));
        expect(mock).toBeCalled();
        
        vm.data.b.c = 3;
        await new Promise((resolve)=>setTimeout(resolve));
        expect(mock).toBeCalledTimes(2);

        vm.data.b.d = 'x';
        await new Promise((resolve)=>setTimeout(resolve));
        expect(mock).toBeCalledTimes(2);
        
        vm.data.d[0] = 0;
        await new Promise((resolve)=>setTimeout(resolve));
        expect(mock).toBeCalledTimes(2);
        
        vm.data.d = vm.data.d.splice(0, 1, 0);
        await new Promise((resolve)=>setTimeout(resolve));
        expect(mock).toBeCalledTimes(3);
    })
    
    test('unwatch data if data not exists', ()=>{
        let mock = jest.fn();

        let vm = {
            watch : {a: mock},
        }

        watchFn(vm, 'Page');
        expect(mock).not.toBeCalled();
    })
})