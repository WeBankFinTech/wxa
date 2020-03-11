import regeneratorRuntime from "regenerator-runtime/runtime";

export const parseRule = (rule) => {
    let params = [];
    const name = rule.split(':')[0];

    if (rule.includes(':')) {
        params = rule.split(':').slice(1).join(':').split(',');
    }

    return { name, params };
};

export const normalizeRules = (rules) => {
    // if falsy value return an empty object.
    if (!rules) {
        return {};
    }

    if (isObject(rules)) {
        return Object.keys(rules).reduce((prev, curr) => {
            let params = [];
            if (rules[curr] === true) {
                params = [];
            } else if (Array.isArray(rules[curr])) {
                params = rules[curr];
            } else {
                params = [rules[curr]];
            }

            if (rules[curr] !== false) {
                prev[curr] = params;
            }

            return prev;
        }, {});
    }

    if (typeof rules !== 'string') {
        console.warn('rules must be either a string or an object.');
        return {};
    }

    return rules.split('|').reduce((prev, rule) => {
        const parsedRule = parseRule(rule);
        if (!parsedRule.name) {
            return prev;
        }

        prev[parsedRule.name] = parsedRule.params;
        return prev;
    }, {});
};

export const isObject = (obj) => obj !== null && obj && typeof obj === 'object' && ! Array.isArray(obj);

export const isEmptyArray = (arr) => {
    return Array.isArray(arr) && arr.length === 0;
};

/**
 * Checks if the values are either null or undefined.
 */
export const isNullOrUndefined = (...values) => {
    return values.every(value => {
        return value === null || value === undefined;
    });
};
/**
 * Checks if a function is callable.
 */
export const isCallable = (func) => typeof func === 'function';

/**
 * Converts an array-like object to array, provides a simple polyfill for Array.from
 */
export const toArray = (arrayLike) => {
    if (isCallable(Array.from)) {
        return Array.from(arrayLike);
    }

    const array = [];
    const length = arrayLike.length;

    for (let i = 0; i < length; i++) {
        array.push(arrayLike[i]);
    }


    return array;
};

export const arraySomeSync = async function (arr, callback) {
    for (let i = 0; i < arr.length; i ++) {
        if (await callback(arr[i], i, arr)) return true;
    }
    return false;
}