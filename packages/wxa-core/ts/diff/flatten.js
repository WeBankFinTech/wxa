// fork from https://github.com/hughsk/flat/blob/master/index.js
// modify for wxa

const getType = (v) => Object.prototype.toString.call(v);

const is = (t, v) => {
    return getType(v) === `[object ${t}]`;
};


function flatten(oldValue, newValue, diff, opts) {
    // if diff element is an array, then just return the array in wxa. so we allways need safe options in wxa.
    opts = opts || {safe: true};

    let delimiter = opts.delimiter || '.';
    let maxDepth = opts.maxDepth;
    let output = {};

    function step(oldValue, newValue, diff, prev, currentDepth) {
        currentDepth = currentDepth || 1;

        Object.keys(diff).forEach(function(key) {
            let diffChildValue = diff[key];
            // new child array added
            let isDiffChildValueArray =
                opts.safe && Array.isArray(diffChildValue);

            let isDiffChildValueObject = is('Object', diffChildValue) || is('Array', diffChildValue);

            let newKey;
            let newChildValue = newValue[key];
            let sourceValue = oldValue ? oldValue[key] : void(0);

            if (Array.isArray(oldValue) && Array.isArray(newValue)) {
                // array element changed or added.
                newKey = prev ? prev + `[${key}]` : key;
            } else {
                newKey = prev ? prev + delimiter + key : key;
            }

            // Check Array
            if (
                (Array.isArray(sourceValue) || is('Object', sourceValue)) &&
                Object.keys(diffChildValue).some((key) => diffChildValue[key] === void 0)
            ) {
                // some array or object element have been deleted.
                // return new array or object.
                return output[newKey] = newChildValue;
            }

            if (
                !isDiffChildValueObject ||
                getType(sourceValue) !== getType(newChildValue)
            ) {
                return output[newKey] = diffChildValue;
            }

            if (
                !isDiffChildValueArray &&
                isDiffChildValueObject &&
                Object.keys(diffChildValue).length &&
                (!opts.maxDepth || currentDepth < maxDepth)
            ) {
                if (
                    currentDepth < 2 ||
                    (currentDepth >= 2 && Object.keys(diffChildValue).length <= 4)
                ) {
                    // tiny object
                    // end process go next step
                    return step(
                        sourceValue,
                        newChildValue,
                        diffChildValue,
                        newKey,
                        currentDepth + 1
                    );
                } else {
                    return output[newKey] = newChildValue;
                }
            }

            output[newKey] = diffChildValue;
        });
    }

    step(oldValue, newValue, diff);

    return output;
}

export default flatten;
