module.exports = {
    'verbose': true,
    'coverageDirectory': './coverage/',
    'collectCoverage': true,
    'coveragePathIgnorePatterns': [
        '<rootDir>/src/utils/deep-merge.js',
        '<rootDir>/src/polyfill/*',
        '<rootDir>/src/test/setup.js',
        '<rootDir>/ts/utils/deep-merge.js',
        '<rootDir>/ts/polyfill/*',
        '<rootDir>/ts/test/setup.js',
        '<rootDir>/dist/*',
        '<rootDir>/packages/wxa-mobx/',
        '<rootDir>/scripts/setupJest.js',
        '<rootDir>/packages/wxa-validate/test/helpers/*',
        '<rootDir>/packages/wxa-compiler-babel/src/fs-cache.js',
    ],
    'testMatch': ["**/test/**/?(*.)+(spec|test).[jt]s?(x)" ],
    'setupFiles': ['./scripts/setupJest.js'],
    "moduleNameMapper": {
        "^@/(.*)$": "<rootDir>/src/$1"
    }
};