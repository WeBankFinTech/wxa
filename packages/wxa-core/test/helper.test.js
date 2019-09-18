import {
    formatDate,
    trim,
    compareVersion,
} from '../ts/utils/helpers';

describe('formatDate', ()=>{
    test('empty stamp', ()=>{
        expect(formatDate(null)).toBe('');
        expect(formatDate(void(0))).toBe('');
        expect(formatDate(0)).toBe('');
        expect(formatDate(NaN)).toBe('');
        expect(formatDate(Infinity)).toBe('');
        expect(formatDate(-Infinity)).toBe('');
    });

    test('normal stamp', ()=>{
        expect(formatDate(new Date(2018, 1, 1), 'yyyy-MM-dd')).toBe('2018-02-01');
        expect(formatDate(new Date(2018, 0, 32), 'yyyy-MM-dd')).toBe('2018-02-01');
        expect(formatDate(new Date(2018, 0, -1), 'yyyy-MM-dd')).toBe('2017-12-30');
    });

    test('coloful format', ()=>{
        expect(formatDate(new Date(2018, 1, 1))).toBe('2018-02-01 00:00:00');

        expect(formatDate(new Date(2018, 1, 1), 'MM/dd/yyyy')).toBe('02/01/2018');

        expect(formatDate(new Date(2018, 1, 1), 'y M d')).toBe('2018 2 1');
        expect(formatDate(new Date(2018, 1, 1), 'M-d')).toBe('2-1');
    });
});

describe('trim', ()=>{
    test('special input', ()=>{
        expect(trim(0)).toBe(0);
        expect(trim('')).toBe('');
        expect(trim(null)).toBe(null);
        expect(trim(void(0))).toBe(void(0));
    });

    test('normal input', ()=>{
        expect(trim(' a ')).toBe('a');
        expect(trim(`a
        `)).toBe('a');
    });
});

describe('compareVersion', ()=>{
    test('special input', ()=>{
        expect(compareVersion(null, '1.1.0')).toBe(-1);
        expect(compareVersion('1.7.0', null)).toBe(1);
    });

    test('normal input', ()=>{
        expect(compareVersion(1.1, '1.1.0')).toBe(0);
        expect(compareVersion(1.2, '1.10')).toBe(-1);
        expect(compareVersion(1.3, '1.1')).toBe(1);
        expect(compareVersion('2.0.0', '1.9.90')).toBe(1);
        expect(compareVersion('1.9.98', '1.9.90')).toBe(1);
    });
});
