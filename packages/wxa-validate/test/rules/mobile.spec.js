import { validate } from '../../ts/rules/mobile';

const valid = [
    '12345678901',
    '19912341232'
];

const invalid = [
    'abc',
    '134',
    null,
    undefined
];

it('validates the username', () => {
    expect.assertions(8);
    // valid.
    valid.forEach(value => expect(validate(value)).toBe(true));
    expect(validate(valid)).toBe(true);

    // invalid
    invalid.forEach(value => expect(validate(value)).toBe(false));
    expect(validate(invalid)).toBe(false);
});
