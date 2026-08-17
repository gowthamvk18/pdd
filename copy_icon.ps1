$src = "c:\Users\ADARS\pdd\public\logo.png"
$res = "c:\Users\ADARS\pdd\android\app\src\main\res"
$dirs = Get-ChildItem -Path $res -Filter "mipmap-*" -Directory

foreach ($d in $dirs) {
    Write-Host "Updating icon in $($d.Name)..."
    Copy-Item -Path $src -Destination (Join-Path $d.FullName "ic_launcher.png") -Force
    Copy-Item -Path $src -Destination (Join-Path $d.FullName "ic_launcher_round.png") -Force
    Copy-Item -Path $src -Destination (Join-Path $d.FullName "ic_launcher_foreground.png") -Force
}
Write-Host "All Android app icons updated successfully!"
