import { validate } from '../../src/rules/after';

it('sets the format and inclusion params if not passed', () => {
    const format = 'DD/MM/YYYY';
    expect(validate('12/09/2016', { targetValue: '11/09/2016', format })).toBe(true);
    expect(validate('10/09/2016', { targetValue: '11/09/2016', format })).toBe(false);
});

it('checks if a date is after another date', () => {
    const format = 'DD/MM/YYYY';
    expect(validate('12/09/2016', { targetValue: '11/09/2016', inclusion: false, format })).toBe(true);
    expect(validate('10/09/2016', { targetValue: '11/09/2016', inclusion: false, format })).toBe(false);

    // test inclusion
    expect(validate('11/09/2016', { targetValue: '11/09/2016', inclusion: true, format })).toBe(true);
    expect(validate('11/09/2016', { targetValue: '11/09/2016', inclusion: false, format })).toBe(false);
});

it('fails validation if any date is invalid', () => {
    const format = 'DD/MM/YYYY';
    expect(validate('12/09/2016', { targetValue: '11/15/2016', inclusion: false, format })).toBe(false);
    expect(validate('31/09/2016', { targetValue: '11/10/2016', inclusion: false, format })).toBe(false);
});

it('fails validation if format is undefined', () => {
    expect(validate('12/09/2016')).toBe(false);
});
