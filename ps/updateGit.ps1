$message = "updates"

Write-Host "..."
Write-Host "..."
Write-Host "..."
Write-Host ""
Write-Host "Git pulling ..."
if ( $arg ) {
  $message = $arg
  Write-Host "Updating git with message... $arg"
}
Write-Host ""
Write-Host "..."
Write-Host "..."
Write-Host "..."

git pull

git add .




git commit -m $message]

git push