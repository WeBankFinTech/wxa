module.exports = {
    'coverageDirectory': './coverage/',
    'collectCoverage': true,
    'coveragePathIgnorePatterns': [
        '<rootDir>/src/utils/deep-merge.js',
    ],
    'globals': {
        'wx': {
            login(obj) {
                setTimeout(() => {
                    obj.success && obj.success();
                }, 1000);
            },
        },
        getApp() {
            return {};
        },
    },
};
