#!/bin/bash

environtment=$1

if [[ $environtment && $environtment == '-e' ]]
then
echo "Starting up environment ..."
source server/src/python/env/bin/activate 
fi

echo "Starting server ... "
git pull 
npm run start