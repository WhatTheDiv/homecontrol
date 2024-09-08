
Write-Host ''
Write-Host ''
Write-Host '-----------------------------------------'
Write-Host '-                                       -'
Write-Host '-                                       -'
Write-Host '-             Running Build             -'
Write-Host '-                                       -'
Write-Host '-                                       -'
Write-Host '-----------------------------------------'
Write-Host ''
Write-Host ''

$proj_root = '~/Documents/Projects/homecontrol'
$client = '/client'

Set-Location $($proj_root + $client)

eas build --platform android --profile preview

Set-Location $proj_root
