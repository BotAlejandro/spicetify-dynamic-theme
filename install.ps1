param (
    [string] $ref = "main"
)

$PSMinVersion = 3

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

if ($PSVersionTable.PSVersion.Major -lt $PSMinVersion) {
    Write-Part "`nYour Powershell version is less than "
    Write-Emphasized "$PSMinVersion"
    Write-Part "`nPlease update PowerShell and run this script again."
    return
}

$ErrorActionPreference = "Stop"
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12

$checkSpice = Get-Command spicetify -ErrorAction SilentlyContinue
if ($null -eq $checkSpice) {
    throw "Spicetify not found. Install Spicetify first, then run this script again."
}

$repoBase = "https://raw.githubusercontent.com/BotAlejandro/spicetify-dynamic-theme/$ref"
$spicePath = spicetify -c | Split-Path
$configFile = Join-Path $spicePath "config-xpui.ini"
$themeDir = Join-Path $spicePath "Themes\DefaultDynamic"
$extDir = Join-Path $spicePath "Extensions"

Write-Part "CLEANING UP    "
Write-Emphasized $configFile
# older versions added this patch, Spotify 1.3.x has nothing left for it to match
$configLines = @(Get-Content $configFile)
$configLines = $configLines | Where-Object {
    $_ -notmatch '^\s*xpui\.js_find_8008\s*=' -and $_ -notmatch '^\s*xpui\.js_repl_8008\s*='
}
Set-Content -Path $configFile -Value $configLines
Write-Done

Write-Part "DOWNLOADING    "
Write-Emphasized $repoBase
New-Item -Path $themeDir -ItemType Directory -Force | Out-Null
New-Item -Path $extDir -ItemType Directory -Force | Out-Null
Invoke-WebRequest -Uri "$repoBase/color.ini" -UseBasicParsing -OutFile (Join-Path $themeDir "color.ini")
Invoke-WebRequest -Uri "$repoBase/user.css" -UseBasicParsing -OutFile (Join-Path $themeDir "user.css")
Invoke-WebRequest -Uri "$repoBase/default-dynamic.js" -UseBasicParsing -OutFile (Join-Path $extDir "default-dynamic.js")
Invoke-WebRequest -Uri "$repoBase/Vibrant.min.js" -UseBasicParsing -OutFile (Join-Path $extDir "Vibrant.min.js")
Write-Done

Write-Part "INSTALLING     "
spicetify config extensions dribbblish.js- extensions dribbblish-dynamic.js- extensions default-dynamic.js- extensions Vibrant.min.js-
spicetify config extensions default-dynamic.js extensions Vibrant.min.js
spicetify config current_theme DefaultDynamic color_scheme Dark-Base
spicetify config inject_css 1 replace_colors 1
Write-Done

Write-Part "APPLYING       "
spicetify apply
Write-Done
