#!/bin/bash

echo " Syncinc folder with Git"

git pull 
git add .
git commit -m 'update'
git push
