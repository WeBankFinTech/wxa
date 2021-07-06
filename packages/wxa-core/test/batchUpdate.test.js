import batchUpdate from '../src/batchUpdate';

describe('batchUpdate', () => {
    global.wx={
        getSystemInfoSync() {
            return '2.2.2';
        },
    };
    test('modify options', ()=>{
        let created = jest.fn();
        let onUnload = jest.fn();
        let componentOptions ={
            created,
            onUnload,
        };

        batchUpdate(componentOptions, 'Component');

        componentOptions.created();
        expect(created).toHaveBeenCalledTimes(1);
        componentOptions.onUnload();
        expect(onUnload).toHaveBeenCalledTimes(1);

        let onLoad = jest.fn();
        let pageOptions ={
            onLoad,
            onUnload,
        };

        batchUpdate(pageOptions, 'Component');

        pageOptions.onLoad();
        expect(onLoad).toHaveBeenCalledTimes(1);
        pageOptions.onUnload();
        expect(onUnload).toHaveBeenCalledTimes(2);
    });

    test('batch setData', (done)=>{
        let setData = jest.fn();
        let options ={
            data: {
                a: {
                    b: {
                        c: 1,
                    },
                },
                q: {
                    w: 1,
                },
                persons: [
                    {
                        name: 'xx',
                    },
                ],
            },
            setData,
        };

        batchUpdate(options, 'Component');
        options.created();

        options.$setData({
            'a.b.c': 2,
        });
        expect(options.data.a.b.c).toBe(2);

        options.$setData({
            'persons[0].name': 'cc',
        });
        expect(options.data.persons[0].name).toBe('cc');

        options.$setData({
            'persons[0]': {name: 'vv'},
        });
        expect(options.data.persons[0].name).toBe('vv');

        options.$setData({
            'a.b.d': 3,
            'q': {m: 5},
            'x': 7,
            'persons[1]': {name: 'tt'},
        });
        expect(options.data).toMatchObject({
            a: {
                b: {
                    d: 3,
                },
            },
            q: {
                m: 5,
            },
            x: 7,
            persons: [{name: 'vv'}, {name: 'tt'}],
        });

        options.$setData({
            'a.b.d': 3,
            'q': {m: 5},
            'x': 7,
            'persons[1]': {name: 'tt'},
        });
        expect(options.data).toMatchObject({
            a: {
                b: {
                    d: 3,
                },
            },
            q: {
                m: 5,
            },
            x: 7,
            persons: [{name: 'vv'}, {name: 'tt'}],
        });

        options.$setData({
            'n.\\..w': 3,
        });
        expect(options.data.n['.'].w).toBe(3);

        setTimeout(() => {
            expect(setData).toHaveBeenCalledTimes(1);
            done();
        }, 0);
    });

    test('setData callback', (done)=>{
        let a = 1;
        let setDataCB = ()=>{
            a = 2;
        };
        let setData = jest.fn((obj, cb)=>{
            cb();
        });
        let options = {
            data: {
                x: 1,
            },
            setData,
        };
        batchUpdate(options, 'Component');
        options.created();

        options.$setData({
            'x': 2,
        }, setDataCB);

        setTimeout(() => {
            expect(a).toBe(2);
            done();
        }, 0);
    });

    test('throw error', ()=>{
        let options = {
            data: {
                x: 1,
            },
        };

        batchUpdate(options, 'Component');
        options.created();

        expect(()=>{
            options.$setData({
                'x': 2,
            }, 5);
        }).toThrow(Error);

        expect(()=>{
            options.$setData();
        }).toThrow(Error);

        expect(()=>{
            options.$setData({'[0]': 1});
        }).toThrow(Error);

        expect(()=>{
            options.$setData({'a[]': 1});
        }).toThrow(Error);

        expect(()=>{
            options.$setData({'a[x]': 1});
        }).toThrow(Error);

        expect(()=>{
            options.$setData({'': 1});
        }).toThrow(Error);
    });

    test('clear timer', ()=>{
        let setData = jest.fn();
        let options ={
            data: {
                x: 1,
            },
            setData,
        };
        batchUpdate(options, 'Component');
        options.created();

        options.$setData({
            'x': 2,
        });
        expect(options._bupdate_batchedUpdatesTimer).not.toBeFalsy();

        options.onUnload();
        expect(options._bupdate_batchedUpdatesTimer).toBeFalsy();
    });
});
