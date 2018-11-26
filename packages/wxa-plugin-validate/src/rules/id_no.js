
const validate = (value) => {
    return /(^\d{18}$)|(^\d{17}(\d|X|x)$)/.test(value);
};

const paramNames = ['locale'];

export {
    validate,
    paramNames
};

export default {
    validate,
    paramNames
};
