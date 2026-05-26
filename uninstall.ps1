function Write-Part ([string] $Text) {
    Write-Host $Text -NoNewline
}

function Write-Emphasized ([string] $Text) {
    Write-Host $Text -NoNewLine -ForegroundColor "Cyan"
}

function Write-Done {
    Write-Host " > " -NoNewline
    Write-Host "OK" -ForegroundColor "Green"
}

$checkSpice = Get-Command spicetify -ErrorAction SilentlyContinue
if ($null -eq $checkSpice) {
    throw "Spicetify not found. Install Spicetify first, then run this script again."
}

$spicePath = spicetify -c | Split-Path
$configFile = Join-Path $spicePath "config-xpui.ini"
$themeDir = Join-Path $spicePath "Themes\DefaultDynamic"
$extDir = Join-Path $spicePath "Extensions"

Write-Part "UNINSTALLING   "
spicetify config current_theme SpicetifyDefault color_scheme green-dark extensions default-dynamic.js- extensions Vibrant.min.js-
Write-Done

Write-Part "REMOVING FILES "
Write-Emphasized $themeDir
Remove-Item -Recurse -Force $themeDir -ErrorAction Ignore
Remove-Item -Force (Join-Path $extDir "default-dynamic.js") -ErrorAction Ignore
Remove-Item -Force (Join-Path $extDir "Vibrant.min.js") -ErrorAction Ignore
Write-Done

Write-Part "UNPATCHING     "
Write-Emphasized $configFile
$configLines = @(Get-Content $configFile)
$configLines = $configLines | Where-Object {
    $_ -notmatch '^\s*xpui\.js_find_8008\s*=' -and $_ -notmatch '^\s*xpui\.js_repl_8008\s*='
}
Set-Content -Path $configFile -Value $configLines
Write-Done

Write-Part "APPLYING       "
spicetify apply
Write-Done
