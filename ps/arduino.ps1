function Get-ShouldContinue {
  param (
    $code,
    $HumanReadableAction
  )
  if ( $code -ge 1) { 
    Write-Error "Code not continuing, exited '$( $HumanReadableAction )' with code  $code"
    return $false 
  }
  else { return $true }
}

Clear-Host

$ErrorActionPreference = "Stop"

$proj_dir = $( Join-Path -Path $(Resolve-Path ~) -ChildPath "Documents\Projects\homecontrol" )
# $proj_dir = "~\Documents\Projects\homecontrol"
$scripts_dir = "\server\src\arduino\"
$stored_dir = "\ps\stored\"
$cfg_filename = "arduino_vars.txt"
$commands = "Compile Script", "Upload Script", "Monitor Port", "Compile & Upload", "Compile & Upload & Monitor" 
$script = $null
$command = $null
$script_suggestion = $null
$command_suggestion = $null


#                              Get or Create cnf file with defaults
if ($( Test-Path -Path "~\Documents\Projects\homecontrol\ps\stored\arduino_vars.txt" ) -eq $false) {
  Write-Host "Dependency does not exist, creating C:/Documents/Projects/Homecontrol/ps/stored/arduino_vars.txt"

  if ($( Test-Path -Path "~\Documents\Projects\homecontrol\ps\stored") -eq $false) {
    New-Item -Path "~/Documents/Projects/Homecontrol/ps" -Name "stored" -ItemType "directory"
  }

  New-Item -Path "~/Documents/Projects/Homecontrol/ps/stored" -Name "arduino_vars.txt" -ItemType "file" -Value @"
LastAccessedScript=null
LastUsedCommand=null
"@ 
  
}

#                              Extract variables in cnf file
$cnf = Get-Content -Path "~/Documents/Projects/Homecontrol/ps/stored/arduino_vars.txt"
$cnf | ForEach-Object {
  $_key = $($_ -split "=")[0]
  $_val = $($_ -split "=")[1]

  if ( $_key -eq "LastAccessedScript" ) { $script = $(If ($_val -ne "null") { $_val } Else { $null }) }
  elseif ( $_key -eq "LastUsedCommand" ) { $command_suggestion = $(If ($_val -ne "null") { $_val } Else { $null }) }
}


#                              ---------------------------------------------------------------------------------------------------------------------
#                              ----------------------------------------------------   Prompt 1  ----------------------------------------------------
#                              ---------------------------------------------------------------------------------------------------------------------


Write-Host ""
Write-Host "***************"
Write-Host ""

Write-Host "-        Select Arduino function        -"
Write-Host ""


#                              Print out commands available
for ($i = 0; $i -lt $commands.Count; $i++) { Write-Host "$($i + 1). " $commands[$i] -Foreground 'yellow' }


#                              Get user input on command selection & Process
#                                          != empty string         (and) [           != Int32             (or)        x <= 0        (or)            x > count     ]
while ( ($command -ne [string]::empty) -And (-not $($command -match '^[\d\.]+$') -Or [Int]$command -le 0 -Or [Int]$command -gt $commands.Count )) {
  Write-Host "          Select option 1 - $($commands.Count)" -NoNewLine
  if ( $null -ne $command_suggestion) {
    Write-Host " ( Default:" $command_suggestion ")" -NoNewLine -Foreground "blue"
  }
  Write-Host ": " -NoNewLine

  $command = Read-Host
  
  if (  $command -eq [string]::empty -And $null -ne $command_suggestion ) {
    continue
  }
  elseif ( $command -eq [string]::empty -And $null -eq $command_suggestion) {
    Write-Host "* Please enter a selection" -Foreground 'red'
  }
  elseif ( -not $($command -match '^[\d\.]+$') ) {
    Write-Host "* Selection is not a number" -Foreground 'red'
  }
  elseif ( [Int]$command -le 0 ) {
    Write-Host "* Selection out of range, low" -Foreground 'red'
  }
  elseif ( [Int]$command -gt $commands.Count ) {
    Write-Host "* Selection out of range, high" -Foreground 'red'
  }

 
}

#                              Handles default case input
if ($command -eq [string]::empty) { $command = $command_suggestion }

Write-Host ""
Write-Host "---" $commands[$( [Int]$command - 1 )] "---" -Foreground 'green'
Write-Host ""


#                              Store or update user selection in cnf
if ($command -ne $command_suggestion) {
  for ($i = 0; $i -lt $cnf.Count; $i++) {
    if ( $cnf[$i].IndexOf("LastUsedCommand") -ge 0 ) {
      $cnf[$i] = "LastUsedCommand=" + [Int]$command
    }
  }

  Set-Content -Path "~\Documents\Projects\homecontrol\ps\stored\arduino_vars.txt" -Value $cnf
}

#                              ---------------------------------------------------------------------------------------------------------------------
#                              ----------------------------------------------------   Prompt 2  ----------------------------------------------------
#                              ---------------------------------------------------------------------------------------------------------------------


Write-Host ""
Write-Host "-        Select Arduino script          -"
Write-Host ""

#                              Collect all arduino scripts in set directory
$files = Get-ChildItem -Path $( $proj_dir, "\server\src\arduino" -join "")
$sel = $null

#                              Exit early if no scripts available
if ( $files.Count -le 0) { Write-Host "No scripts available" -Foreground 'red'; Exit; }
$count = 1

#                              Print out available scripts
$files | ForEach-Object { Write-Host  "$($count). $($_.Name).ino" -Foreground "yellow"; $count++ }


#                              Setup suggestion index number
if ( $null -eq $script) {
  $script_suggestion = 1
}
else {
  for ($i = 0; $i -lt $files.Count; $i++) { if ( $files[$i].Name -eq $script ) { $script_suggestion = $( $i + 1); break; } }
  if ( $null -eq $script_suggestion) { $script_suggestion = 1 }
}

 

#                              Prompt for script name
while ( ($sel -ne [string]::empty) -And (-not $($sel -match '^[\d\.]+$') -Or [Int]$sel -le 0 -Or [Int]$sel -gt $files.Count )) {
  Write-Host "          Select option 1 - $( $files.Count )" -NoNewline
  Write-Host " ( Default: $script_suggestion - $( $files[$script_suggestion-1].Name ).ino)" -Foreground "Blue" -NoNewline
  Write-Host ": " -NoNewline
  $sel = Read-Host
  
  if (  $sel -eq [string]::empty) {
    $sel = $script_suggestion
    break;
  }
  elseif (-not $($sel -match '^[\d\.]+$') ) {
    Write-Host "* Selection is not a number" -Foreground 'red'
  }
  elseif ( [Int]$sel -le 0 ) {
    Write-Host "* Selection out of range, low" -Foreground 'red'
  }
  elseif ( [Int]$sel -gt $files.Count ) {
    Write-Host "* Selection out of range, high" -Foreground 'red'
  }
}

#                              Juggle script name and LastAccessedScript
$LastAccessedScript = $script
$script = $files[[Int]$sel - 1].Name


#                              Update LastAccessScript
if ($script -ne $LastAccessedScript) {
  for ($i = 0; $i -lt $cnf.Count; $i++) {
    if ( $cnf[$i].IndexOf("LastAccessedScript") -ge 0 ) { 
      $cnf[$i] = "LastAccessedScript=" + $script 
    }
  }
  Set-Content -Path $( $proj_dir, $stored_dir, $cfg_filename -join '' ) -Value $cnf
}

#                              Assign script selection
$script = $files[[Int]$sel - 1].Name


#                              Display functionality
Write-Host " "
Write-Host "--- Script: $($script ).ino ---" -Foreground 'green'
Write-Host "--- Method: $( $commands[$( [Int]$command - 1 )] ) ---" -Foreground 'green'
Write-Host " "


#                              Set script directory
$p = $( $proj_dir, $scripts_dir, $script -join "")
Write-Host "Script path: " $p -Foreground "yellow"


#                              Execute commands 
switch ([Int]$command - 1) {
  
  #                                        "Compile Script"
  0 { 
    Write-Host "Command 1 $( $commands[0] )" -Foreground "yellow"
    arduino-cli compile --fqbn arduino:avr:nano $( $p )
  }
  
  #                                        "Upload Script"
  1 { 
    Write-Host "Command 2 $( $commands[1] )" -Foreground "yellow"
    arduino-cli upload --fqbn arduino:avr:nano -p "COM3" $( $p ) 
  }
  
  #                                        "Monitor Port"
  2 { 
    Write-Host "Command 3 $( $commands[2] )" -Foreground "yellow"
    arduino-cli monitor -p "COM3" 
  }
  
  #                                        "Compile & Upload"
  3 { 
    Write-Host "Command 4 $( $commands[3] )" -Foreground "yellow"
    arduino-cli compile --fqbn arduino:avr:nano -u -p "COM3" $( $p ) 
  }
   
  #                                        "Compile & Upload & Monitor"
  4 { 
    Write-Host "Command 5 $( $commands[4] )" -Foreground "yellow"
    arduino-cli compile --fqbn arduino:avr:nano -u -p "COM3" $( $p ) 
    if ( $(Get-ShouldContinue $LASTEXITCODE "Compile & Upload") ) { 
      arduino-cli monitor -p "COM3" 
    }    
  }
}








