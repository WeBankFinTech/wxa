import diff from '../../src/diff/diff';


describe('get diff flatten data with this.data', ()=>{
    let ob = {
        data: {
            name: 'iveswen',
        },
    };

    let bindDiff = diff.bind(ob);

    test('diff falsy value', ()=>{
        expect(bindDiff(null)).toBeFalsy();
        expect(bindDiff('')).toBeFalsy();
        expect(bindDiff(void(0))).toBeFalsy();
        expect(bindDiff(/.*/)).toBeFalsy();
        expect(bindDiff(()=>{})).toBeFalsy();
    });

    test('diff origin value', ()=>{
        expect(bindDiff(ob.data)).toMatchObject({});
    });

    test('unbind diff value', ()=>{
        expect(diff(ob.data)).toBeFalsy();
        expect(diff(null)).toBeFalsy();
        expect(diff('')).toBeFalsy();
    });
});
