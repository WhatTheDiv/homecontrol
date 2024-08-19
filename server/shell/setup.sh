#!/bin/bash
clear

echo "root is " $root

echo "pulling updates from git ... "
git pull


echo "updating apt-get ... "

sudo apt-get update

echo "installing python 3.6 specifically ... "
sudo apt-get install python3.6




echo "installing adafruit-circuitpython-ahtx0 ..."
pip3 install adafruit-circuitpython-ahtx0





















# sudo apt-get install samba -y
# sudo systemctl enable --now smbd