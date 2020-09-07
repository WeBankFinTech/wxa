import diff from '../../src/diff/diff';


describe('get diff flatten data with this.data', ()=>{
    let ob = {
        data: {
            name: 'iveswen',
            hey: 'guys',
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

    test('correct output', ()=>{
        expect(bindDiff({name: 'genuifx'})).toMatchObject({name: 'genuifx'});
        expect(bindDiff({name: 'genuifx', __webviewId__: void(0)})).toMatchObject({name: 'genuifx'});
        expect(bindDiff({name: 'genuifx', toString: ()=>{}})).toMatchObject({name: 'genuifx'});
    });
});

describe('diff array', ()=>{
    let arr1 = [{a: 1, b: 2, c: 3}];

    let arr2 = [{a: 1, b: 2}];

    test('get diff properties', ()=>{
        let page = {
            data: {
                x: arr1,
            },
        };

        let pageDiff = diff.bind(page);

        expect(pageDiff({x: arr2})).toMatchObject({'x[0]': {a: 1, b: 2}});
    });

    test('get diff properties', ()=>{
        let page = {
            data: {
                x: arr1,
            },
        };

        let pageDiff = diff.bind(page);

        expect(pageDiff({x: [{a: 1, b: 2, c: {a: 1}}]})).toMatchObject({'x[0].c': {a: 1}});
    });
});
