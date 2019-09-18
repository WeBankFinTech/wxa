module.exports = {
  preset: 'ts-jest',
  transform: {
      '^.+\.(js|ts)$': 'ts-jest',
  },
  moduleFileExtensions: [
    'ts',
    'tsx',
    'js',
  ],
  verbose: true,
  coverageDirectory: './coverage/',
  collectCoverage: true,
  coveragePathIgnorePatterns: [
      '<rootDir>/ts/utils/deep-merge.js',
      '<rootDir>/ts/polyfill/*',
      '<rootDir>/test/setup.js',
  ],
  testMatch: ['**/test/**/*.test.(ts|js)'],
  setupFiles: ['./test/setup.js'],
};
