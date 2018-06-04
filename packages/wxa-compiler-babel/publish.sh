#!/bin/bash

rm -rf ./dist

npm run build 2> /dev/null

if [ $? -eq 0 ]
then
  echo "build OK, publishing"
  cp README.md ./dist/README.md
  cp package.json ./dist/package.json

  NPM_USER=$(npm whoami 2> /dev/null)
  echo ${NPM_USER}
  if [ "${NPM_USER}" != "genuifx" ]; then
    echo "You must be logged in as 'genuifx' to publish. Use 'npm login'."
    exit
  fi

  set -ex

  npm publish --access public ./dist --tag beta

else
  echo "Compilation failed" >&2
fi
