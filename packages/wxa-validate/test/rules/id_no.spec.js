import { validate } from '../../src/rules/id_no';

const invalid = [
    '文字',
    'sab',
    '123',
    'F1234567',
    undefined,
    null
];

const valid = [
    '440101199505051234',
    '44010119950505123x',
    '44010119950505123X'
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
