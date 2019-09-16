// fork from https://github.com/hughsk/flat/blob/master/index.js
// modify for wxa

interface Opts {
  delimiter?: string,
  maxDepth?: string | number,
  safe?: boolean,
}

interface Diff {
  [propName: string]: any;
}

function flatten(oldValue: string, newValue: string, diff: Diff, opts: Opts) {
    // if diff element is an array, then just return the array in wxa. so we allways need safe options in wxa.
  opts = opts || { safe: true };

  const delimiter = opts.delimiter || '.';
  const maxDepth = opts.maxDepth;
  const output = {};

  function step(oldValue: string, newValue: string, diff: Diff, prev: string, currentDepth: number) {
    currentDepth = currentDepth || 1;
    Object.keys(diff).forEach(function (key) {
      const diffChildValue = diff[key];
      const isDiffChildValueArray = opts.safe && Array.isArray(diffChildValue);

      const typeOfDiff = Object.prototype.toString.call(diffChildValue);
      const isDiffChildValueObject = (
            typeOfDiff === '[object Object]' ||
            typeOfDiff === '[object Array]'
        );

      let sourceValue;
      let newKey;
      const newChildValue = newValue[key];

      newKey = prev ? prev + delimiter + key : key;

      if (oldValue) {
            // hasValue, meaning that new value still contain old one.
        sourceValue = oldValue[key];

        if (
                (
                    Array.isArray(sourceValue) ||
                    (Object.prototype.toString.call(sourceValue) === '[object Object]')
                ) &&
                Object.keys(diffChildValue).some((key) => diffChildValue[key] === void(0))
            ) {
                // some array or object element have been deleted.
                // return new array or object.
          output[newKey] = newChildValue;
          return;
        }  if (Array.isArray(oldValue)) {
                // array element changed or added.
          newKey = prev ? prev + `[${key}]` : key;
        }
      }

      if (!isDiffChildValueArray && isDiffChildValueObject && Object.keys(diffChildValue).length &&
          (!opts.maxDepth || currentDepth < maxDepth)) {
        return step(sourceValue, newChildValue, diffChildValue, newKey, currentDepth + 1);
      }

      output[newKey] = diffChildValue;
    });
  }

  step(oldValue, newValue, diff);

  return output;
}

export default flatten;
