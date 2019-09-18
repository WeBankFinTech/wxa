export default function promisify(api) {
    return (...argument) => {
        if (argument.length === 1 && typeof argument[0] === 'object') {
            return new Promise((resolve, reject) => {
                api({...(argument[0]), success: resolve, fail: reject});
            });
        }
    };
};
