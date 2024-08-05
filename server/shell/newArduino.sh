#!/bin/bash

echo "Creating new arduino sketch ..."

name=$1

if [[ $name ]]
then

echo " - Script name: $name.ino - "
arduino-cli sketch new src/arduino/$name

else

echo "!!! Please provide filename as first arguement"

fi

