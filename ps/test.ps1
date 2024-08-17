Clear-Host
Write-Host ""
Write-Host "---------- Start ---------- "
Write-Host ""

$proj_dir = "\Documents\Projects\homecontrol"
$scripts_dir = "\server\src\arduino\"
$stored_dir = "\ps\stored\"
$cfg_filename = "arduino_vars.txt"


$p = Join-Path -Path $(Resolve-Path ~) -ChildPath $proj_dir 



Write-Host $p
Write-Host "---------- End ------------"
Write-Host ""
















<#



  $v = $_ -split "=" 
  Write-Host $v[1]
  if ( $v[1] -eq "null" ) {
    $LastAccessedScript = $null
  }
  else {
    $LastAccessedScript = $v[1]
  }


#>