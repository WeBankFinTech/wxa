
const validate = (value) => {
    return /^\d{6}$/.test(value);
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
