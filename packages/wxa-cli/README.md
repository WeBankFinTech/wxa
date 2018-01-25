# wxa-cli

cli for wechat miniprogram develop.

# Usage

`wxa build`

# configurations

core configs file is `wxa.config.js`, mostly like below:

```javascript
const path = require("path");
const UglifyjsPlugin = require("/usr/local/lib/node_modules/wxa-plugin-uglifyjs");
const ReplacePlugin = require("/usr/local/lib/node_modules/wxa-plugin-replace");
var prod = process.env.NODE_ENV === "production";

module.exports = {
    resolve: {
        alias: {
            counter: path.join(__dirname, "src/components/counter"),
            "@": path.join(__dirname, "src")
        },
        extensions: [".js", ".json", "ts"]
    },
    compilers: {
        sass: {
            outputStyle: "compressed"
        },
        babel: {
            sourceMap: false,
            presets: [
                [
                    "env",
                    {
                        useBuiltIn: true,
                        debug: true
                    }
                ]
            ],
            plugins: [
                "transform-class-properties",
                "transform-decorators-legacy",
                "transform-object-rest-spread",
                "transform-export-extensions"
                // 'transform-runtime'
            ],
            ignore: "node_modules"
        }
    },
    plugins: [
        new UglifyjsPlugin(),
        new ReplacePlugin({
            list: [
                {
                    regular: new RegExp("APP_ENV", "gm"),
                    value: "bcds"
                }
            ]
        })
    ]
};

if (prod) {
    delete module.exports.compilers.babel.sourcesMap;
}
```
