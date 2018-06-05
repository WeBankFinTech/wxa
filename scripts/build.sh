#!/bin/bash

# core
cd ./packages/wxa-core
npm run prebuild
npm run build

# cli
cd ../wxa-cli
npm run build

# compiler-babel
cd ../wxa-compiler-babel
npm run build

# compiler-sass
cd ../wxa-compiler-sass
npm run build

# compiler-stylus
cd ../wxa-compiler-stylus
npm run build

# redux
cd ../wxa-redux
npm run build

# redux
cd ../watch-wxa-plugin
npm run build

