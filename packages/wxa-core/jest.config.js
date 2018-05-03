module.exports = {
    'coverageDirectory': './coverage/',
    'collectCoverage': true,
    'coveragePathIgnorePatterns': [
        '<rootDir>/src/utils/deep-merge.js',
    ],
    'globals': {
        'wx': {},
        getApp() {
            return {};
        },
    },
};
