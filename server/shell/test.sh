#!/bin/bash


echo 'Test'
$root = ([IO.DirectoryInfo] $PSScriptRoot).Parent
$base = $root.Parent
$root.FullName
$base.FullName