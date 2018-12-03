import { validate } from '../../src/rules/username';

const valid = [
    '姓名',
    '西塱站',
    '宋喆',
    '买买提明·买买提'
];

const invalid = [
    'abc',
    '134',
    '姓名A',
    '姓名3',
    '空 格',
    undefined,
    null
];

it('validates the username', () => {
    expect.assertions(13);
    // valid.
    valid.forEach(value => expect(validate(value)).toBe(true));
    expect(validate(valid)).toBe(true);

    // invalid
    invalid.forEach(value => expect(validate(value)).toBe(false));
    expect(validate(invalid)).toBe(false);
});
