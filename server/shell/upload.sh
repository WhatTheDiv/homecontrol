#!/bin/bash


echo " "
echo "---------------------------------------"
echo "---   Uploading arduino script...   ---"
echo "      ( Script Name: $1.ino )"           
echo "---------------------------------------"
echo " "


script=$1
method=$2
monitor=$3

# method = -c || false for compile
# method = -u for compile and upload

#monitor = true for monitoring

if [[ $script == '-h' ]]
then

  echo " "
  echo " "
  echo "Script to compile or compile and upload script to arduino board. Hardcoded assumptions are ..."
  echo ""
  echo "::: pwd       =   _homecontrol/server "
  echo "::: src       =   _homecontrol/server/src/arduino"
  echo "::: Board     =   arduino:avr:nano"
  echo "::: USB Port  =   /dev/cu.usbserial-140"
  echo ""

  echo "Arg 1 (req)      :      filename"
  echo "    - Filename of script folder" 
  echo " "
  echo "Arg 2 (opt)      :      -u"
  echo "    - Upload flag"

elif [[ $script == '-m' ]]
then
  arduino-cli monitor -p /dev/cu.usbserial-1140 
elif [[ $script ]]
then
  found=false

  for file in ./src/arduino/*
    do
      f=${file#./src/arduino/}

      if [[ $f == $script ]]
        then
          found=true
          echo "Found file."
          echo ""
        fi
    done

  if [[ $found == false ]]
    then
      echo "File not found in ./src/arduino"
  else
    echo "Compiling ... "
    echo ""
    arduino-cli compile --fqbn arduino:avr:nano ./src/arduino/$script

    if [[ $method && $method == '-u' ]]
      then
        echo ""
        echo "Uploading ... "
        echo ""
        arduino-cli upload -p /dev/cu.usbserial-1140 --fqbn arduino:avr:nano ./src/arduino/$script

        if [[ $monitor && $monitor == '-m' ]]
        then
          arduino-cli monitor -p /dev/cu.usbserial-140 
        fi

      fi
  fi

  
else 
  echo "Please provide script name from ./src/arduino"
  ls ./src/arduino
fi




echo " "
echo " "
echo " "
echo "-------------- Finished. --------------"
echo " "