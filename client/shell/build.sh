#!/bin/bash

clear

echo ''
echo ' ------------------- '
echo ''
echo 'Running build.'
echo ''
echo ' ------------------- '
echo ''


git pull 
git add .
git commit -m 'pre-build update'
git push


case $1 in

update)
echo 'Updating preview profile ...'
eas update --branch Stable --message 'Pushing update test message';;

*)
echo 'Building preview profile ...'
eas build --platform android --profile preview ;;

esac