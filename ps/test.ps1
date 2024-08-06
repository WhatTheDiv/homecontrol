Write-Host "Hello world!"

Set-Location "~/documents/projects/homecontrol"

Write-Host "Formatted list ... "
Get-ChildItem |  ForEach-Object { Write-Host $_.Name }

Write-Host "Test Get" -NoNewline
$res = Get-Host
Write-Host $res