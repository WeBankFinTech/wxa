import * as utils from '@/utils';
import * as dateUtils from '@/utils/date';

describe('util', () => {
    it('checks if a value is an object', () => {
        expect(utils.isObject(null)).toBe(false);
        expect(utils.isObject([])).toBe(false);
        expect(utils.isObject('someval')).toBe(false);
        expect(utils.isObject({})).toBe(true);
    });

    it('checks if a value is a empty array', () => {
        expect(utils.isEmptyArray('someval')).toBe(false);
        expect(utils.isEmptyArray({})).toBe(false);
        expect(utils.isEmptyArray([1])).toBe(false);
        expect(utils.isEmptyArray([])).toBe(true);
    });

    it('checks if a value is a callable function', () => {
        expect(utils.isCallable(null)).toBe(false);
        expect(utils.isCallable(() => {})).toBe(true);
    });

    it('checks if a value is null or undefined', () => {
        expect(utils.isNullOrUndefined(null)).toBe(true);
        expect(utils.isNullOrUndefined(undefined)).toBe(true);
        expect(utils.isNullOrUndefined('null')).toBe(false);
    });

    it('converts array like objects to arrays', () => {
        document.body.innerHTML = `
            <div class="class"></div>
            <div class="class"></div>
            <div class="class"></div>
        `;

        const nodeList = document.querySelectorAll('.class');
        expect(Array.isArray(nodeList)).toBe(false);

        let array = utils.toArray(nodeList);
        expect(Array.isArray(array)).toBe(true);
    });
})

describe('normalizes rules', () => {
    it('it normalizes string validation rules', () => {
        const rules = utils.normalizeRules('required|email|min:3|dummy:1,2,3|||');
        expect(rules).toEqual({
            required: [],
            email: [],
            min: ['3'],
            dummy: ['1', '2', '3']
        });
    });

    it('returns empty object if falsy rules value', () => {
        expect(utils.normalizeRules('')).toEqual({});
        expect(utils.normalizeRules(false)).toEqual({});
        expect(utils.normalizeRules(null)).toEqual({});
        expect(utils.normalizeRules(undefined)).toEqual({});
        expect(utils.normalizeRules(1)).toEqual({});
    });

    it('it normalizes object validation rules', () => {
        const rules = utils.normalizeRules({
            required: true,
            email: true,
            min: 3,
            dummy: [1, 2, 3],
            numeric: false
        });
        expect(rules).toEqual({
            required: [],
            email: [],
            min: [3],
            dummy: [1, 2, 3]
        });
    });
});

describe('pareses date values', () => {
    const format = 'DD-MM-YYYY';

    test('parses string formatted dates without allowing overflows', () => {
        expect(dateUtils.parseDate('11-12-2016', format)).toBeTruthy();
        expect(dateUtils.parseDate('11-13-2016', format)).toBe(null);
    });

    test('date objects are checked if they are valid', () => {
        expect(dateUtils.parseDate(new Date(2017, 12, 11), format)).toBeTruthy();
        expect(dateUtils.parseDate(new Date(2017, 13, 11), format)).toBeTruthy();
        expect(dateUtils.parseDate(Date.parse('foo'), format)).toBe(null);
    });
});
