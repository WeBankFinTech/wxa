module.exports = {
    "presets": ["@babel/preset-env", "@babel/typescript"],
    "plugins": [
        ["@babel/plugin-proposal-decorators", {"decoratorsBeforeExport": true}],
        ["@babel/plugin-proposal-class-properties"]
    ]
}