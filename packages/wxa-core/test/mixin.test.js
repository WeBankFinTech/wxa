import mixin from '../src/base/mixin';


describe('mixin', ()=>{
    test('empty mixin', ()=>{
        let vm = {};

        let dvm = mixin(vm);

        expect(dvm).toMatchObject({
            methods: expect.any(Object),
            data: expect.any(Object),
        });
    });

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
        let vm = {
            mixins: [common],
            data: {
                a: 2,
                b: 2,
            },
            methods: {
                test: jest.fn(),
            },
        };

        let dvm = mixin(vm);

        expect(dvm).toMatchObject({
            data: {
                a: 2,
                b: 2,
                c: 3,
            },
            methods: {
                test: expect.anything(),
            },
        });
        dvm.methods.test();
        dvm.methods.test2();
        expect(vm.methods.test.mock.calls.length).toBe(1);
        expect(common.methods.test.mock.calls.length).toBe(0);
        expect(common.methods.test2.mock.calls.length).toBe(1);
    });

    test('nesting mixins', ()=>{
        let nest = {
            methods: {
                test3: jest.fn(),
            },
        };
        let common = {
            mixins: [nest],
            data: {
                a: 1,
                c: 3,
            },
            methods: {
                test: jest.fn(),
                test2: jest.fn(),
            },
        };
        let vm = {
            mixins: [common],
            data: {
                a: 2,
                b: 2,
            },
            methods: {
                test: jest.fn(),
            },
        };

        let dvm = mixin(vm);
        dvm.methods.test3();
        expect(dvm.methods.test3).toHaveBeenCalled();
    });

    test('merge hook', ()=>{
        let common = {
            onLoad: jest.fn(),
            onShow: jest.fn(),
        };
        let onLoad = jest.fn();
        let onShow = jest.fn();
        let vm = {
            mixins: [common],
            onLoad,
            onShow,
        };

        let dvm = mixin(vm);

        expect(dvm.onLoad).not.toBeFalsy();
        expect(dvm.onShow).not.toBeFalsy();

        dvm.onLoad();
        expect(common.onLoad).toHaveBeenCalled();
        expect(onLoad).toHaveBeenCalled();

        dvm.onShow();
        expect(common.onShow).toHaveBeenCalled();
        expect(onShow).toHaveBeenCalled();
    });
});
