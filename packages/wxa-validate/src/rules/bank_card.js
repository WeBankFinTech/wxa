const validate = (value) => {
    if (Array.isArray(value)) {
        return value.every(val => /^[0-9]{15,19}$/.test(String(val)));
    }

    return /^[0-9]{15,19}$/.test(String(value));
};

export {
    validate
};

export default {
    validate
};
