import {isNullOrUndefined} from "../utils";

const isUsername = /^[\u4E00-\u9FA5][\u4E00-\u9FA5|·|•]*[\u4E00-\u9FA5]$/;

const validate = (value) => {
    if (isNullOrUndefined(value)) {
        value = '';
    }
    if (Array.isArray(value)) {
        return value.every(val => isUsername.test(val));
    }
    return isUsername.test(value);

};

export {
    validate
};

export default {
    validate
};
