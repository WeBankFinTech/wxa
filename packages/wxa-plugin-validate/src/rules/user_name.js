
const validate = (value) => {
    return /^[\u4E00-\u9FA5][\u4E00-\u9FA5|·|•]*[\u4E00-\u9FA5]$/.test(value);
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
