import { validate } from '../../src/rules/bank_card';

const valid = [
    '6222023602099932110',
    '622202360209993211',
    '62220236020999321',
    '6222023602099932',
    '622202360209993',
];

const invalid = [
    'abc',
    '134',
    null,
    undefined
];

it('validates the username', () => {
    expect.assertions(11);
    // valid.
    valid.forEach(value => expect(validate(value)).toBe(true));
    expect(validate(valid)).toBe(true);

    // invalid
    invalid.forEach(value => expect(validate(value)).toBe(false));
    expect(validate(invalid)).toBe(false);
});
