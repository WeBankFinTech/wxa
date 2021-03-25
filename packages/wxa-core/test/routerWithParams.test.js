import {
    default as Router,
} from '../src/utils/router';
import { getRoutersParams } from '../src/utils/routerWithParams';
import {
    addNoPromiseApi,
} from '../src/utils/wxapi';

import {wxa} from '../src/wxa';

describe('router', ()=>{
    test('fn call', ()=>{
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
        addNoPromiseApi([]);
    });

    test('access params', ()=>{
        let onLoadA = jest.fn();
        // let onLoadB = jest.fn();

        let pageA = {
            onLoad: (query, params) => {
                onLoadA(params)
            },
        }
        wxa.launchPage(pageA, 'pages/pageA');
        let router = new Router();
        let paramsData = {x:1};
        router.push('./pageA', {params: paramsData });
        
        let routersParams = getRoutersParams();
        expect(routersParams.value).toEqual(paramsData);
    });
});

