module.exports = {
    'verbose': true,
    'coverageDirectory': './coverage/',
    'collectCoverage': true,
    'coveragePathIgnorePatterns': [
        '<rootDir>/src/utils/deep-merge.js',
        '<rootDir>/test/setup.js',
    ],
    'testMatch': ['**/test/*.test.js'],
    'setupFiles': ['./test/setup.js'],
};
