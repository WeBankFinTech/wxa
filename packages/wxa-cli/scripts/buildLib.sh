echo $MODE;

if test "$MODE" = 'dev'
then
    npx babel ./lib/regenerator-runtime/runtime.js --out-dir ./lib-dist/regenerator-runtime/runtime.js --source-maps

    npx babel ./lib/wxa_wrap.js --out-dir ./lib-dist/ --source-maps

    npx webpack --config ./lib/webpack.config.js --watch

else
    npx webpack --config ./lib/webpack.config.js

    npx babel ./lib/regenerator-runtime/runtime.js --out-dir ./lib-dist/regenerator-runtime/runtime.js

    npx babel ./lib/wxa_wrap.js --out-dir ./lib-dist/
fi
