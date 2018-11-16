module.exports = {
    'verbose': true,
    'coverageDirectory': './coverage/',
    'collectCoverage': true,
    'coveragePathIgnorePatterns': [
        '<rootDir>/test/setup.js',
    ],
    'testMatch': ['**/test/**/*.test.js'],
    'setupFiles': ['./test/setup.js'],
};
