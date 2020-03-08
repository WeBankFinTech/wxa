
if [ $MODE=='dev' ]
then
    npx webpack --config ./lib/webpack.config.js --watch

    npx babel ./lib/regenerator-runtime/runtime.js --out-dir ./lib-dist/regenerator-runtime/runtime.js  --watch --source-maps

    npx babel ./lib/wxa_wrap.js --out-dir ./lib-dist/wxa_wrap.js --watch --source-maps
else
    npx webpack --config ./lib/webpack.config.js

    npx babel ./lib/regenerator-runtime/runtime.js --out-dir ./lib-dist/regenerator-runtime/runtime.js

    npx babel ./lib/wxa_wrap.js --out-dir ./lib-dist/wxa_wrap.js
fi
