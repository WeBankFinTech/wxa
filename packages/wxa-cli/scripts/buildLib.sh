# npx webpack  "./lib/shim/promise.finally.js" --mode production --env.platform=node  -o ./lib-dist/es/promise.finally.js

# cp -R ./src/tester/wxa-e2eTest ./lib-dist/wxa-e2eTest
cp ./src/tester/wxa-e2eTest/e2eRecord2jsTpl.ejs ./dist/tester/wxa-e2eTest
mkdir ./lib-dist/wxa-e2eTest
cp ./src/tester/wxa-e2eTest/e2eTestSuite.js ./lib-dist/wxa-e2eTest/
cp ./src/tester/wxa-e2eTest/e2eRecordBtn.wxa ./lib-dist/wxa-e2eTest/
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
