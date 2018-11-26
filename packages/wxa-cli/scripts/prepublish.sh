#!/bin/bash

# cd ..

pl=$(ls | grep "package-lock.json")

if [ $pl ]
then
    echo "There is package-lock.json."

    rm package-lock.json
else
    echo "There isn't package-lock.json file here."
fi

npm run build
