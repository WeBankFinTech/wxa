
const validate = (value) => {
    return /^[0-9]{15,19}$/.test(value);
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
