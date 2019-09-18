jest.mock('../src/utils/wxapi');

import {
    default as fetch,
    setMaxRequest,
    setRequestExpiredTime,
} from '../../ts/utils/fetch';

let originConsole = console;
describe('fetch api', ()=>{
    let wrapStatusCode = (data)=>({statusCode: 200, data});
    test('normal', async ()=>{
        await expect(fetch('/users/4', {}, {}, 'post')).resolves.toEqual(wrapStatusCode({name: 'Mark'}));

        await expect(fetch('/users/5', {}, {}, 'post')).resolves.toEqual(wrapStatusCode({name: 'Paul'}));

        await expect(fetch('/users/5', {}, {}, 'get')).resolves.toEqual(wrapStatusCode({name: 'Paul'}));

        await expect(fetch('/users/6', {}, {}, 'post')).rejects.toMatchSnapshot();
    });

    test('404', async ()=>{
        await expect(fetch('/users/-1', {}, {}, 'post')).rejects.toMatchObject({statusCode: 404});
    });

    test('multi request', async ()=>{
        let c1 = jest.fn();
        await fetch('/users/1', {}, {}, 'post').catch(c1);
        await fetch('/users/2', {}, {}, 'post').catch(c1);
        await fetch('/users/3', {}, {}, 'post').catch(c1);
        await fetch('/users/7', {}, {}, 'post').catch(c1);
        await fetch('/users/8', {}, {}, 'post').catch(c1);
        await fetch('/users/9', {}, {}, 'post').catch(c1);

        expect(c1).toHaveBeenCalledTimes(6);

        await expect(fetch('/users/10', {}, {}, 'post')).resolves.toEqual(wrapStatusCode({name: 'Ives'}));
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

        await fetch('/users/1', {}, {}, 'post').catch(c1);

        await fetch('/users/1', {}, {}, 'post').catch(c1);
        await fetch('/users/2', {}, {}, 'post').catch(c1);

        expect(c1).toHaveBeenCalledTimes(3);
    });

    test('setRequestExpiredTime', async ()=>{
        expect(setRequestExpiredTime(void(0))).toBe(null);
        expect(setRequestExpiredTime(null)).toBe(null);

        let c1 = jest.fn();

        setRequestExpiredTime(0);
        await fetch('/users/4', {}, {}, 'post').catch(c1);

        await expect(fetch('/users/4', {}, {}, 'post')).resolves.toEqual(wrapStatusCode({name: 'Mark'}));

        setRequestExpiredTime(500);
        fetch('/users/1', {}, {}, 'post').catch(c1);
        await expect(fetch('/users/1', {}, {}, 'post')).rejects.toEqual({data: {code: -101, msg: '重复的请求'}});
    });
});
