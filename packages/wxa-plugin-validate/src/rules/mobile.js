
const validate = (value) => {
    return /^1\d{10}$/.test(value);
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
