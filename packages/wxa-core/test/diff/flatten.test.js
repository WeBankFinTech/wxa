import flatten from '../../src/diff/flatten';

describe('flatten object for wxa', ()=>{
    test('normal object without array', ()=>{
        expect(flatten(
            {
                a: {
                    b: 2,
                    c: 3,
                },
            },
            {
                a: {
                    b: 3,
                    c: 3,
                },
            },
            {
                a: {
                    b: 3,
                },
            }
        )).toMatchObject({'a.b': 3});

        expect(flatten(
            {
                a: {c: {d: 3}},
            },
            {
                a: {c: {d: 1}},
            },
            {
                a: {c: {d: 1}},
            }
        )).toMatchObject({'a.c.d': 1});

        expect(flatten(
            {
                userInfo: {
                    name: 'iveswen',
                },
                score: 1000,
            },
            {
                userInfo: {
                    name: 'Genuifx',
                },
                score: 2000,
            },
            {
                userInfo: {
                    name: 'Genuifx',
                },
                score: 2000,
            }
        )).toMatchObject({'userInfo.name': 'Genuifx', 'score': 2000});
    });

    test('normal object with array', ()=>{
        expect(flatten(
            {
                a: {
                    b: 3,
                    c: [],
                },
            },
            {
                a: {
                    b: 3,
                    c: [, {b: 1}],
                },
            },
            {
            a: {
                c: {
                    '1': {b: 1},
                },
            },
        })).toMatchObject({'a.c[1]': {'b': 1}});

        expect(flatten(
            {
                a: {
                    b: 3,
                    c: 1,
                },
            },
            {
                a: {
                    b: 3,
                    c: [1, 2, 3],
                },
            },
            {
                a: {
                    c: [1, 2, 3],
                },
            }
        )).toMatchObject({'a.c': [1, 2, 3]});

        // delete
        expect(flatten(
            {
                a: {
                    b: 3,
                    c: [1, 2, 3],
                },
            },
            {
                a: {
                    b: 3,
                    c: [1, 2],
                },
            },
            {
                a: {
                    c: {
                        '3': void(0),
                    },
                },
            }
        )).toMatchObject({'a.c': [1, 2]});
    });

    test('setting undefine to newValue', ()=>{
        let oldValue = {
            name: 'iveswen',
            age: 25,
            school: 'JNU',
            fav: {
                a: 'football',
            },
        };
        let newValue = {
            name: 'iveswen',
            age: 25,
            school: void(0),
            fav: {
                a: 'football',
            },
        };
        let newValueWithDelete = {
            name: 'iveswen',
            age: 25,
            school: void(0),
            fav: {
                b: 'football',
            },
        };

        expect(flatten(oldValue, newValue, {school: void(0)})).toMatchObject({school: void(0)});

        expect(flatten(oldValue, newValueWithDelete, {school: void(0), fav: {a: void(0), b: 'football'}})).toMatchObject({school: void(0), fav: {b: 'football'}});
    });

    test('Big Different Object', ()=>{
        expect(flatten(
            {
                user$: {
                    b: 3,
                    order: {
                        c: [1, 2],
                        d: 1,
                        e: 2,
                        f: 3,
                        d1: 1,
                        e22: 2,
                        f2: 4,
                    },
                },
            },
            {
                user$: {
                    b: 3,
                    order: {
                        c: [1, 2],
                        d: 1,
                        e: 2,
                        f: 3,
                        d1: 1,
                        e22: 2,
                        f2: 4,
                    },
                },
            },
            {
                user$: {
                    b: 4,
                    order: {
                        c: [1, 2],
                        d: 1,
                        e: 2,
                        f: 3,
                        d1: 1,
                    },
                },
            }
        )).toMatchObject({
            'user$.b': 4,
            'user$.order': {c: [1, 2], d: 1, e: 2, f: 3, d1: 1, e22: 2, f2: 4},
          });
    });

    test('diff data Array to Object', ()=>{
        expect(flatten(
            {
                user$: {},
            },
            {
                user$: [],
            },
            {
                user$: [],
            }
        )).toMatchObject({
            'user$': [],
          });
    });
});
