import {
    default as Router,
} from '../src/utils/router';

test('router', ()=>{
    let navigateTo = jest.fn();
    let redirectTo = jest.fn();
    let reLaunch = jest.fn();
    let switchTab = jest.fn();
    let navigateBack = jest.fn();

    global.wx = {
        navigateBack,
        switchTab,
        reLaunch,
        redirectTo,
        navigateTo,
    };

    let router = new Router();

    router.push('abc');

    expect(navigateTo).toHaveBeenCalled();
    expect(navigateTo.mock.calls[0][0]).toMatchObject({url: 'abc', success: expect.any(Function), fail: expect.any(Function)});

    router.replace('aa');
    expect(redirectTo).toHaveBeenCalled();
    expect(redirectTo.mock.calls[0][0]).toMatchObject({url: 'aa', success: expect.any(Function), fail: expect.any(Function)});

    router.reLaunch('b');
    expect(reLaunch).toHaveBeenCalled();
    expect(reLaunch.mock.calls[0][0]).toMatchObject({url: 'b', success: expect.any(Function), fail: expect.any(Function)});

    router.switch('c');
    expect(switchTab).toHaveBeenCalled();
    expect(switchTab.mock.calls[0][0]).toMatchObject({url: 'c', success: expect.any(Function), fail: expect.any(Function)});

    router.go(-1);
    router.goBack();
    expect(navigateBack.mock.calls[0][0]).toMatchObject({delta: 1});
    expect(navigateBack.mock.calls[1][0]).toMatchObject({delta: 1});

    router.close();
    expect(navigateBack.mock.calls[2][0]).toMatchObject({delta: 1});

    expect(router.get()).toMatchObject({});
});

