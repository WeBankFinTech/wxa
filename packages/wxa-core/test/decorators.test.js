import {
    readonly,
    GetApp,
} from '../src/utils/decorators';

describe('wxa decorator', ()=>{
    test('mount app to class GetApp', ()=>{
        @GetApp
        class T {}
        let i = new T();

        expect(i.app).not.toBeFalsy();
    });
});
