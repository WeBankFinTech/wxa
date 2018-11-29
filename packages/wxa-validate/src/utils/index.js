export const parseRule = (rule) => {
    let params = [];
    const name = rule.split(':')[0];

    if (rule.includes(':')) {
        params = rule.split(':').slice(1).join(':').split(',');
    }

    return { name, params };
};

export const isObject = (obj) => obj !== null && obj && typeof obj === 'object' && ! Array.isArray(obj)

export const normalizeRules = (rules) => {
    // if falsy value return an empty object.
    if (!rules) {
        return {};
    }

    if (isObject(rules)) {
        // $FlowFixMe
        return Object.keys(rules).reduce((prev, curr) => {
            let params = [];
            // $FlowFixMe
            if (rules[curr] === true) {
                params = [];
            } else if (Array.isArray(rules[curr])) {
                params = rules[curr];
            } else if (isObject(rules[curr])) {
                params = rules[curr];
            } else {
                params = [rules[curr]];
            }

            // $FlowFixMe
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

export const isEmptyArray = (arr) => {
    return Array.isArray(arr) && arr.length === 0;
};
