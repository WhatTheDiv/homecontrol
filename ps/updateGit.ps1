git pull

git add .

$message = "updates"
if ( not $arg ) {
  $message = $arg[0]
}

git commit -m $message]

git push