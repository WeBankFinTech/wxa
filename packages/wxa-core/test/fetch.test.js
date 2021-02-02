jest.mock('../ts/utils/wxapi');

import {
    default as fetch,
    setMaxRequest,
    setRequestExpiredTime,
} from '../ts/utils/fetch';

const users = {
    4: {name: 'Mark'},
    5: {name: 'Paul'},
    10: {name: 'Ives'},
    11: {name: 'Genuifx'},
};

beforeAll(()=>{
    global.wx.request = function(options) {
        const userID = parseInt(options.url.substr('/users/'.length), 10);
        let res = () => userID < 0 ? options.success({statusCode: 404}) : users[userID]
            ? options.success({statusCode: 200, data: users[userID]})
            : options.fail({
                statusCode: 200,
                error: 'User with ' + userID + ' not found.',
            });
        let id = setTimeout(res, 500);

        return {
            abort: () => {
                clearTimeout(id);
                options.fail({errMsg: 'request:fail abort'});
            }
        };
    };
});

describe('fetch api', ()=>{
    let wrapStatusCode = (data)=>({statusCode: 200, data});
    test('just make a normal request', async () => {
        
        await expect(fetch('/users/4', {}, {}, 'post')).resolves.toEqual(wrapStatusCode({name: 'Mark'}));

        await expect(fetch('/users/5', {}, {}, 'post')).resolves.toEqual(wrapStatusCode({name: 'Paul'}));

        await expect(fetch('/users/5', {}, {}, 'get')).resolves.toEqual(wrapStatusCode({name: 'Paul'}));

        await expect(fetch('/users/6', {}, {}, 'post')).rejects.toMatchSnapshot();
    });

    test('404 page', async ()=>{
        await expect(fetch('/users/-1', {}, {}, 'post')).rejects.toMatchObject({statusCode: 404});
    });

    test('make multi request one time', async ()=>{
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

    test('reject same request in expired time (default 500ms)', async ()=>{

        let noo = ()=>{};
        fetch('/users/1', {}, {}, 'post').catch(noo);
        fetch('/users/1', {boo: 1}, {}, 'post').catch(noo);

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

    test('setup request expired time', async ()=>{
        expect(setRequestExpiredTime(void(0))).toBe(null);
        expect(setRequestExpiredTime(null)).toBe(null);
        
        let c1 = jest.fn();
        
        setRequestExpiredTime(0);
        fetch('/users/4', {}, {}, 'post').catch(c1);
        
        expect(fetch('/users/4', {}, {}, 'post')).resolves.toEqual(wrapStatusCode({name: 'Mark'}));
        
        setMaxRequest(10);
        setRequestExpiredTime(1000);
        fetch('/users/1000', {}, {}, 'post').catch(c1);
        await expect(fetch('/users/1000', {}, {}, 'post')).rejects.toEqual({data: {code: -101, msg: '重复的请求'}});
    });
});

describe('enaled request abort task', ()=>{
    test('make request with abort function', async ()=>{
        let req = fetch('/users/11', {}, {$withCancel: true});

        expect(req).toMatchSnapshot();
        expect(req.request).not.toBeFalsy();
        expect(req.defer).not.toBeFalsy();
        expect(req.cancel).not.toBeFalsy();
        
        req.cancel();
        await expect(req.request).rejects.toMatchObject({errMsg: 'request:fail abort'});
    });
});
