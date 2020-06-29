module.exports = {
    'verbose': true,
    'coverageDirectory': './coverage/',
    'collectCoverage': true,
    'coveragePathIgnorePatterns': [
        '<rootDir>/packages/wxa-core/src/utils/deep-merge.js',
        '<rootDir>/packages/wxa-core/src/polyfill/*',
        '<rootDir>/packages/wxa-core/src/test/setup.js',
        '<rootDir>/packages/wxa-core/dist/*',
        '<rootDir>/packages/wxa-mobx/',
        '<rootDir>/scripts/setupJest.js',
        '<rootDir>/packages/wxa-validate/test/helpers/*',
        '<rootDir>/packages/wxa-compiler-babel/src/fs-cache.js',
    ],
    'testMatch': ['**/test/**/*.test.js', '**/test/**/*.spec.js'],
    'setupFiles': ['./scripts/setupJest.js'],
    "moduleNameMapper": {
        "^@/(.*)$": "<rootDir>/src/$1"
    }
};
