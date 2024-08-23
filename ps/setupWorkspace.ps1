# Clear terminal
Clear-Host

Write-Host ""
Write-Host "-------------------------------------------------"
Write-Host "-------------------------------------------------"
Write-Host "----*                                   *--------"
Write-Host "----*     Beginning Workspace Setup     *--------"
Write-Host "----*                                   *--------"
Write-Host "-------------------------------------------------"
Write-Host "-------------------------------------------------"
Write-Host ""


# Scripts
$cmd_arduino = "./arduino.ps1"
$cmd_client = "git pull && npm run start"
$cmd_server = "ssh hotpi"

# Working Directories
$proj_root = '~/Documents/Projects/homecontrol'
$cmd_arduino_wd = $( $proj_root + "/ps")
$cmd_client_wd = $( $proj_root + "/client")

# Clear working directory
# Set-Location

# # Update project from git 
# Set-Location .\Documents\Projects\homecontrol
# git pull

Start-Process wt pwsh,  -NoExit, -command, $cmd_server,  ';',  "split-pane -V", pwsh, -NoExit , -workingdirectory, $cmd_arduino_wd,  -command, $cmd_arduino, ';', "split-pane", pwsh, -NoExit, -workingdirectory, $cmd_client_wd, -command, $cmd_client

code .

exit







# $processes_before = Get-Process -Name pwsh | ForEach-Object { $_.Id }






# Start-Process wt pwsh,  -NoExit, -command, "ssh hotpi",  ';',  "split-pane", pwsh, -NoExit, -command, "ipconfig \n hostname"

# Start-Process wt pwsh,  -NoExit, -command, "ssh hotpi" | Write-Host

# Start-Process wt "sp -p pwsh -nop -noexit -command './Documents/Projects/homecontrol/ps/arduino.ps1'"
# wt '-p "Windows Powershell" --title HotPi -noop -noexit -command ipconfig' 
# Start-Process wt '-p "Windows Powershell" --title HotPi  ; split-pane -p "Windows Powershell" --title Arduino -nop -noexit -command "./Documents/Projects/homecontrol/ps/arduino.ps1"' 


#; split-pane -p pwsh' -command Write-Host "hello world"
# Timeout /T 1



# Start-Process wt "sp -p 'NoProfile' pwsh -nop -noexit -command './Documents/Projects/homecontrol/ps/arduino.ps1'"



#Write-Host "hello world"








# $processes_new = Get-Process -Name pwsh | ForEach-Object { 
#   if( !($processes_before -contains $_.Id)){ 
#     $_.Id
#   }
# }
# wt "-w 'Arduino' -noexit -command './Documents/Projects/homecontrol/ps/arduino.ps1'"

# Write-Host "New Processes: " $($processes_new -join ', ')

















# start wt 'sp -p "NoProfile" powershell -nop -noexit -command Get-Process'



