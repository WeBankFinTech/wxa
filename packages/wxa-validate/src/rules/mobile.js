
const validate = (value) => {
    if (Array.isArray(value)) {
        return value.every(val => /^1\d{10}$/.test(String(val)));
    }

    return /^1\d{10}$/.test(String(value));
};

export {
    validate
};

export default {
    validate
};
