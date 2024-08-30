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

function Select-Hardware ($lastUsedPort){

  $lastPortIndex = $null
  $hardwareIndexChoice = $null
  $updatedPort = $null
  $j = 0

  Write-Host ""
  Write-Host "-               Select Hardware                -"
  Write-Host ""

  # [x]                              Read hardware list available
  $hardware = (Get-PnPDevice | Where-Object{$_.PNPClass -in  "WPD","AndroidUsbDeviceClass","Modem","Ports" } | 
    Where-Object{$_.Present -in "True" -and $_.Name.IndexOf("COM1") -lt 0} | 
    Select-Object Name,Description,Manufacturer,PNPClass,Service,Present,Status,DeviceID | 
    Sort-Object DeviceID)

  # [x]                              Get index of last used port if available
  $lastPortIndex = $hardware | ForEach-Object { 
    $_.Name -split " " | ForEach-Object { 
      if( $_.IndexOf("COM") -ge 0 -and $_  -contains $lastUsedPort ){ 
        $j 
      } 
    } 
    $j ++
    Write-Host "$($j). $($_.Name) " -Foreground 'yellow'
  }

  # [x]                              Take input for hardware selection
  Write-Host "          Select option 1 - $($hardware.Count)" -NoNewLine
  if ($null -ne $lastPortIndex){
    Write-Host " ( Default: $($lastPortIndex + 1) - $($lastUsedPort.Substring(     $($lastUsedPort.IndexOf("(") + 1), $( $lastUsedPort.IndexOf(")") - 1)     )) )" -foreground "blue" -NoNewLine
  }
  Write-Host ": " -NoNewLine
  $selectedPortIndex = Read-Host

  # [x]                              Take input for hardware selection ---- Error handle bad input & repeat
  while ( ($selectedPortIndex -ne [string]::empty) -And (-not $($selectedPortIndex -match '^[\d\.]+$') -Or [Int]$selectedPortIndex -le 0 -Or [Int]$selectedPortIndex -gt $commands.Count )) {
    if (  $selectedPortIndex -eq [string]::empty -And $null -ne $lastPortIndex ) {
      break;
    }
    elseif ( $selectedPortIndex -eq [string]::empty -And $null -eq $lastPortIndex) {
      Write-Host "* Please enter a selection" -Foreground 'red'
    }
    elseif ( -not $($selectedPortIndex -match '^[\d\.]+$') ) {
      Write-Host "* Selection is not a number" -Foreground 'red'
    }
    elseif ( [Int]$selectedPortIndex -le 0 ) {
      Write-Host "* Selection out of range, low" -Foreground 'red'
    }
    elseif ( [Int]$selectedPortIndex -gt $hardware.Count ) {
      Write-Host "* Selection out of range, high" -Foreground 'red'
    }
    else {
      break;
    }

    Write-Host "          Select option 1 - $($hardware.Count)" -NoNewLine
    if ($null -ne $lastPortIndex){
      Write-Host " ( Default: $($lastPortIndex + 1) - $($lastUsedPort.Substring(     $($lastUsedPort.IndexOf("(") + 1), $( $lastUsedPort.IndexOf(")") - 1)     )) )" -foreground "blue" -NoNewLine
    }
    Write-Host ": " -NoNewLine
    $selectedPortIndex = Read-Host
  }

  # [ ]                              Take input for hardware selection
  if( [string]::empty -eq $selectedPortIndex){
    # default case
    $hardwareIndexChoice = $selectedPortIndex
  }
  else {
    # selection made
    $hardwareIndexChoice = $lastPortIndex
  }
  $hw_untrimmed = $hardware[$hardwareIndexChoice-1].Name -split " " | ForEach-Object { if( $_.indexOf("COM") -ge 0 ){ $_ }}
  $hw_trimmed = $($hw_untrimmed.Substring(     $($hw_untrimmed.IndexOf("(") + 1), $( $hw_untrimmed.IndexOf(")") - 1)     ))

  # [ ]                              Update hardware selection if different from storage
  if( $lastUsedPort -ne $hw_untrimmed){
    $updatedPort = $hw_untrimmed
  }


  Write-Host " "
  Write-Host "--- Port: $hw_trimmed ---" -Foreground 'green'
  Write-Host " "

  return @($hw_untrimmed,$hw_trimmed,$updatedPort)

}

function Select-Board ( $suggestion, $list ){
  function Format-fqbn($string){

    $name = $($($($string -replace '\s', '') -split "/")[0]).replace("."," ")
    $fqbnString = $($string -split "/")[1]

    return @($name, $fqbnString)
  } 

  Write-Host ""
  Write-Host "-               Select Board                   -"
  Write-Host ""


  
  $k = 0
  $suggestion_name, $suggestion_fqbn = if($null -ne $suggestion){Format-fqbn $suggestion} Else {$null, $null}
  $suggestion_index = $null
  $updated_fqbnString = $null

  # [x] List all boards downloaded
  $list | ForEach-Object {
    $name, $fqbnString = Format-fqbn $_
    $consecutiveCharCountUntilFqbn = 20
    $spaces = ""

    if($null -ne $suggestion_fqbn -and $fqbnString -eq $suggestion_fqbn){ $suggestion_index = $k }
    $k++
    for ($i = 0; $i -lt $( $consecutiveCharCountUntilFqbn - $name.Length); $i++) {$spaces += " "}
    Write-Host "$k. $name $spaces $fqbnString" -ForegroundColor "yellow"
  }
  
  
  
  # [x]                              Take input for board selection
  Write-Host "          Select option 1 - $($list.Count)" -NoNewLine
    if($null -ne $suggestion_index){ Write-Host " ( Default $([int]$suggestion_index + 1) - $suggestion_fqbn )" -NoNewline -ForegroundColor "blue"}
  Write-Host ":" -NoNewline
  $selected_index = Read-Host

  # [x]                              Take input for board selection ---- Error handle bad input & repeat
  while ( 
    (($selected_index -ne [string]::empty) -And (-not $($selected_index -match '^[\d\.]+$') `
    -Or [Int]$selected_index -le 0 `
    -Or [Int]$selected_index -gt $list.Count )) `
    -or $selected_index -eq [string]::empty -And $null -ne $suggestion_index `
    ){

    if (  $selected_index -eq [string]::empty -And $null -ne $suggestion_index ) {
      break;
    }
    elseif ( $selected_index -eq [string]::empty -And $null -eq $suggestion_index) {
      Write-Host "* Please enter a selection" -Foreground 'red'
    }
    elseif ( -not $($selected_index -match '^[\d\.]+$') ) {
      Write-Host "* Selection is not a number" -Foreground 'red'
    }
    elseif ( [Int]$selected_index -le 0 ) {
      Write-Host "* Selection out of range, low" -Foreground 'red'
    }
    elseif ( [Int]$selected_index -gt $list.Count ) {
      Write-Host "* Selection out of range, high" -Foreground 'red'
    }
    else {
      break;
    }

    Write-Host "          Select option 1 - $($list.Count)" -NoNewLine
    if($null -ne $suggestion_index){ Write-Host " ( Default $($suggestionIndex + 1) - $suggestion_fqbn )" -NoNewline -ForegroundColor "blue"}
    Write-Host ":" -NoNewline
    $selected_index = Read-Host
  }
 
  # [x]                              Set chosen variables
  
  $selected_name, $selected_fqbn = if( $selected_index -eq [string]::empty) {$suggestion_name, $suggestion_fqbn} Else {Format-fqbn $($list[$([int]$selected_index-1)])}
  

  # [x]                              Set update variable if necessary
  if($selected_index -ne [string]::empty -and $([int]$selected_index-1) -ne $($suggestion_index)){ 
    $updated_fqbnString = $list[$([int]$selected_index-1)] 
  }

  Write-Host ""
  Write-Host "--- Name: $selected_name ---" -Foreground 'green'
  Write-Host "--- Fqbn: $selected_fqbn ---" -Foreground 'green'
  Write-Host ""

  return @( $selected_name, $selected_fqbn, $updated_fqbnString)
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
$port_suggestion = $null
$fqbn_suggestion = $null
$fqbn_list = @()




# [x]                             Get or Create cnf file with defaults
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

# [x]                             Extract variables in cnf file
$cnf = Get-Content -Path "~/Documents/Projects/Homecontrol/ps/stored/arduino_vars.txt"
$cnf | ForEach-Object {
  $brk = $_.IndexOf("=")
  $_key = $_.Substring(0,$($brk))
  $_val = $_.Substring($brk + 1)

  if ( $_key -eq "LastAccessedScript" ) { $script = $(If ($_val -ne "null") { $_val } Else { $null }) }
  elseif ( $_key -eq "LastUsedCommand" ) { $command_suggestion = $(If ($_val -ne "null") { $_val } Else { $null }) }
  elseif ($_key -eq "LastUsedPort") { $port_suggestion = $( if ($_val -ne "null") { $_val } Else { $null }) }
  elseif ($_key -eq "fqbnList" -or $_key -eq "LastUsedFQBN") { 
    if($null -eq $_val) {continue}
    elseif($_key -eq "LastUsedFQBN"){ 
      $fqbn_suggestion = $_val
      Write-Host "Suggestion from storage: $_val"
    }
    elseif($_key -eq "fqbnList"){ 
      $_val -split ',' | ForEach-Object { 
        $fqbn_list += $_ 
      }
    }
  }
}

Write-Host ""
Write-Host "***************"
Write-Host ""


#                                 ---------------------------------------------------------------------------------------------------------------------
#                                 ----------------------------------------------------   Prompt 1  ----------------------------------------------------
#                                 ---------------------------------------------------------------------------------------------------------------------


# [x]                             Select hardware
$hw_untrimmed, $hw_trimmed, $updatedPort = Select-Hardware $port_suggestion


#                                 ---------------------------------------------------------------------------------------------------------------------
#                                 ----------------------------------------------------   Prompt 2  ----------------------------------------------------
#                                 ---------------------------------------------------------------------------------------------------------------------

# [x]                             Select board
$boardName, $fqbn, $updated_fqbnString   = Select-Board $fqbn_suggestion $fqbn_list





#                                 ---------------------------------------------------------------------------------------------------------------------
#                                 ----------------------------------------------------   Prompt 3  ----------------------------------------------------
#                                 ---------------------------------------------------------------------------------------------------------------------

# [x]                             Select function

Write-Host ""
Write-Host "-               Select Arduino function        -"
Write-Host ""


# [x]                             Print out commands available
for ($i = 0; $i -lt $commands.Count; $i++) { Write-Host "$($i + 1). " $commands[$i] -Foreground 'yellow' }


# [x]                             Get user input on command selection & Process
# [x]                                         != empty string         (and) [           != Int32             (or)        x <= 0        (or)            x > count     ]
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

# [x]                             Handles default case input
if ($command -eq [string]::empty) { $command = $command_suggestion }

Write-Host ""
Write-Host "---" $commands[$( [Int]$command - 1 )] "---" -Foreground 'green'
Write-Host ""


# [x]                             Store or update user selection in cnf
if ($command -ne $command_suggestion) {
  for ($i = 0; $i -lt $cnf.Count; $i++) {
    if ( $cnf[$i].IndexOf("LastUsedCommand") -ge 0 ) {
      $cnf[$i] = "LastUsedCommand=" + [Int]$command
    }
  }

  Set-Content -Path "~\Documents\Projects\homecontrol\ps\stored\arduino_vars.txt" -Value $cnf
}

#                                 ---------------------------------------------------------------------------------------------------------------------
#                                 ----------------------------------------------------   Prompt 4  ----------------------------------------------------
#                                 ---------------------------------------------------------------------------------------------------------------------


Write-Host ""
Write-Host "-               Select Arduino script          -"
Write-Host ""

# [x]                             Collect all arduino scripts in set directory
$files = Get-ChildItem -Path $( $proj_dir, "\server\src\arduino" -join "")
$sel = $null

# [x]                             Exit early if no scripts available
if ( $files.Count -le 0) { Write-Host "No scripts available" -Foreground 'red'; Exit; }
$count = 1

# [x]                             Print out available scripts
$files | ForEach-Object { Write-Host  "$($count). $($_.Name).ino" -Foreground "yellow"; $count++ }


# [x]                             Setup suggestion index number
if ( $null -eq $script) {
  $script_suggestion = 1
}
else {
  for ($i = 0; $i -lt $files.Count; $i++) { if ( $files[$i].Name -eq $script ) { $script_suggestion = $( $i + 1); break; } }
  if ( $null -eq $script_suggestion) { $script_suggestion = 1 }
}

 

# [x]                             Prompt for script name
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

# [x]                             Juggle script name and LastAccessedScript
$LastAccessedScript = $script
$script = $files[[Int]$sel - 1].Name


# [x]                             Update Script storage file
for ($i = 0; $i -lt $cnf.Count; $i++) {
  if ( $cnf[$i].IndexOf("LastAccessedScript") -ge 0 -and $script -ne $LastAccessedScript ) { 
    $cnf[$i] = "LastAccessedScript=" + $script 
  }
  elseif ( $cnf[$i].IndexOf("LastUsedPort") -ge 0 -and $null -ne $updatedPort){
    Write-Host "Updated port: $updatedPort "
    $cnf[$i] = "LastUsedPort=" + $updatedPort
  }
  elseif ( $cnf[$i].IndexOf("LastUsedFQBN") -ge 0 -and $null -ne $updated_fqbnString){
    Write-Host "Updated port: $updated_fqbnString"
    $cnf[$i] = "LastUsedFQBN=" + $updated_fqbnString
  }
}
Set-Content -Path $( $proj_dir, $stored_dir, $cfg_filename -join '' ) -Value $cnf


# [x]                             Assign script selection
$script = $files[[Int]$sel - 1].Name


# [x]                             Display functionality
Write-Host " "
Write-Host "--- Port: $hw_trimmed" -Foreground 'green'
Write-Host "--- Board: $boardName" -Foreground 'green'
Write-Host "--- Fqbn: $fqbn" -Foreground 'green'
Write-Host "--- Script: $($script ).ino ---" -Foreground 'green'
Write-Host "--- Method: $( $commands[$( [Int]$command - 1 )] ) ---" -Foreground 'green'
Write-Host " "


# [x]                             Set script directory
$p = $( $proj_dir, $scripts_dir, $script -join "")
Write-Host "Script path: " $p -Foreground "yellow"


# [x]                             Execute commands 
switch ([Int]$command - 1) {
  
  # [x]                                       "Compile Script"
  0 { 
    Write-Host "Command 1 $( $commands[0] )" -Foreground "yellow"
    arduino-cli compile --fqbn $fqbn $( $p )
  }
  
  # [x]                                       "Upload Script"
  1 { 
    Write-Host "Command 2 $( $commands[1] )" -Foreground "yellow"
    arduino-cli upload --fqbn $fqbn -p $hw_trimmed $( $p ) 
  }
  
  # [x]                                       "Monitor Port"
  2 { 
    Write-Host "Command 3 $( $commands[2] )" -Foreground "yellow"
    arduino-cli monitor -p $hw_trimmed 
  }
  
  # [x]                                       "Compile & Upload"
  3 { 
    Write-Host "Command 4 $( $commands[3] )" -Foreground "yellow"
    arduino-cli compile --fqbn $fqbn -u -p $hw_trimmed $( $p ) 
  }
   
  # [x]                                       "Compile & Upload & Monitor"
  4 { 
    Write-Host "Command 5 $( $commands[4] )" -Foreground "yellow"
    arduino-cli compile --fqbn $fqbn -u -p $hw_trimmed $( $p ) 
    if ( $(Get-ShouldContinue $LASTEXITCODE "Compile & Upload") ) { 
      arduino-cli monitor -p $hw_trimmed 
    }    
  }
}








