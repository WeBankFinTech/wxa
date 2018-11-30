module.exports = {
    "testMatch": [
        "**/test/**/*.js"
    ],
    // "testPathIgnorePatterns": [
    //     "/helpers/"
    // ],
    // "collectCoverageFrom": [
    //     "src/**/*.js",
    //     "!src/index.*.js",
    //     "!src/install.js",
    //     "!src/use.js",
    //     "!src/messages.js",
    //     "!src/plugins/date/messages.js"
    // ],
    "moduleFileExtensions": [
        "js",
        "json"
    ],
    "transform": {
        "^.+\\.js$": "babel-jest"
    },
    "moduleNameMapper": {
        "^@/(.*)$": "<rootDir>/src/$1"
    }
}
