# npx webpack  "./lib/shim/promise.finally.js" --mode production --env.platform=node  -o ./lib-dist/es/promise.finally.js

rm -f ./dist/tester/wxa-e2eTest/e2eTestCaseTpl.ejs
rm -f ./dist/tester/wxa-e2eTest/e2eTpl.ejs
rm -rf ./lib-dist/wxa-e2eTest
mkdir -p ./lib-dist/wxa-e2eTest
mkdir -p ./dist/tester/wxa-e2eTest
mkdir -p ./dist/tester/imageSimilarity
ln ./src/tester/wxa-e2eTest/state.js ./lib-dist/wxa-e2eTest/state.js
ln ./src/tester/wxa-e2eTest/e2eTestSuite.js ./lib-dist/wxa-e2eTest/e2eTestSuite.js
ln ./src/tester/wxa-e2eTest/e2eMockWxMethod.js ./lib-dist/wxa-e2eTest/e2eMockWxMethod.js
ln ./src/tester/wxa-e2eTest/e2eRecordBtn.wxa ./lib-dist/wxa-e2eTest/e2eRecordBtn.wxa
ln ./src/tester/wxa-e2eTest/e2eTestCaseTpl.ejs ./dist/tester/wxa-e2eTest/e2eTestCaseTpl.ejs
ln ./src/tester/wxa-e2eTest/e2eTpl.ejs ./dist/tester/wxa-e2eTest/e2eTpl.ejs

ln ./src/tester/imageSimilarity/dHash.py ./dist/tester/imageSimilarity/dHash.py
ln ./src/tester/imageSimilarity/init.py ./dist/tester/imageSimilarity/init.py

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
