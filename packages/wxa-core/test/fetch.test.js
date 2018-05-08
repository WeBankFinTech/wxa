jest.mock('../src/utils/wxapi');

import {
    default as fetch,
    setMaxRequest,
} from '../src/utils/fetch';

let originConsole = console;
describe('fetch api', ()=>{
    test('normal', async ()=>{
        await expect(fetch('/users/4', {}, {}, 'post')).resolves.toEqual({name: 'Mark'});

        await expect(fetch('/users/5', {}, {}, 'post')).resolves.toEqual({name: 'Paul'});

        await expect(fetch('/users/5', {}, {}, 'get')).resolves.toEqual({name: 'Paul'});

        await expect(fetch('/users/6', {}, {}, 'post')).rejects.toThrow();
    });

    test('multi request', async ()=>{
        let c1 = jest.fn();
        fetch('/users/1', {}, {}, 'post').catch(c1);
        fetch('/users/2', {}, {}, 'post').catch(c1);
        fetch('/users/3', {}, {}, 'post').catch(c1);
        fetch('/users/7', {}, {}, 'post').catch(c1);
        fetch('/users/8', {}, {}, 'post').catch(c1);
        fetch('/users/9', {}, {}, 'post').catch(c1);

        setImmediate(async ()=>{
            expect(c1).toHaveBeenCalledTimes(6);

            await expect(fetch('/users/10', {}, {}, 'post')).resolves.toEqual({name: 'Ives'});
        });
    });

    test('reject same request', async ()=>{
        let warn = jest.fn();
        global.console = {
            warn,
        };
        let noo = ()=>{};
        await fetch('/users/1', {}, {}, 'post').catch(noo);
        await fetch('/users/1', {boo: 1}, {}, 'post').catch(noo);
        await fetch('/users/2', {}, {}, 'post').catch(noo);
        await fetch('/users/3', {}, {}, 'post').catch(noo);

        expect(warn).toHaveBeenCalledTimes(3);

        await expect(fetch('/users/1', {}, {}, 'post')).rejects.toEqual({data: {code: -101, msg: '重复的请求'}});
    });

    test('set Multi request', async ()=>{
        expect(setMaxRequest(void(0))).toBe(null);
        expect(setMaxRequest(null)).toBe(null);
        setMaxRequest(2);

        let c1 = jest.fn();

        await fetch('/users/1', {}, {}, 'post').then(()=>{
            originConsole.log('succ');
        }, ()=>{
            originConsole.log('fail');
        }).catch(c1);

        await fetch('/users/1', {}, {}, 'post').catch(c1);
        await fetch('/users/2', {}, {}, 'post').catch(c1);

        expect(c1).toHaveBeenCalledTimes(2);
    });
});
