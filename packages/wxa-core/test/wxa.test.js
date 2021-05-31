import {Wxa, default as wxa} from '../ts/wxa';
import 'jest-plugin-console-matchers/setup';

describe('wxa unit test', ()=>{
    test('set debug mode', ()=>{
        let wxaInstance = new Wxa();

        wxaInstance.setDebugMode(true);
        expect(()=>wxaInstance.setDebugMode(true)).toConsoleWarn();
        expect(()=>wxaInstance.setDebugMode(true)).toConsoleInfo();

        wxaInstance.setDebugMode(false);
        expect(wxaInstance.IS_DEBUG).toBe(false);
    });

    test('wxa launch app instance', ()=>{
        const wxaInstance = new Wxa();
        const mock = jest.fn();
        wxaInstance.use(()=>{
            return ()=>{
                mock();
            };
        });

        wxaInstance.launchApp({});

        expect(mock).toHaveBeenCalled();
    });

    test('wxa launch component instance', ()=>{
        const wxaInstance = new Wxa();
        const mock = jest.fn();
        wxaInstance.use(()=>{
            return ()=>{
                mock();
            };
        });

        wxaInstance.launchComponent({});

        expect(mock).toHaveBeenCalled();
    });

    test('wxa launch page instance', ()=>{
        const wxaInstance = new Wxa();

        wxaInstance.launchPage({}, 'pages/index');

        expect(wxaInstance.$$pageMap.get('pages/index')).not.toBeFalsy();
    });

    test('wxa globalMixin', ()=>{
        const wxaInstance = new Wxa();
        const mock = jest.fn();

        wxaInstance.mixin(()=>mock());
        expect(mock).not.toBeCalled();

        wxaInstance.launchPage({});
        expect(mock).toBeCalled();

        wxaInstance.launchComponent({});
        expect(mock).toBeCalledTimes(2);

        wxaInstance.launchApp({});
        expect(mock).toBeCalledTimes(2);
    });
});
