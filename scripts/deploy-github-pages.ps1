# Builds the Expo web export and pushes static files to the gh-pages branch.
# Requires: GitHub repo at origin and authenticated git credentials.

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot
$DeployDir = Join-Path (Split-Path -Parent $Root) "JustDoIT-gh-pages"

Write-Host "Exporting web build..."
Push-Location $Root
npm run export:web
Pop-Location

Write-Host "Preparing gh-pages branch in $DeployDir ..."
if (Test-Path $DeployDir) {
    Remove-Item -Recurse -Force $DeployDir
}
New-Item -ItemType Directory -Path $DeployDir | Out-Null
Copy-Item -Recurse (Join-Path $Root "dist\*") $DeployDir
New-Item -ItemType File -Path (Join-Path $DeployDir ".nojekyll") -Force | Out-Null

Push-Location $DeployDir
git init
git checkout -b gh-pages
git add -A
git commit -m "Deploy Ethos web demo for GitHub Pages"
git remote add origin https://github.com/Likhith083/JustDoIT.git
git push -u origin gh-pages --force
Pop-Location

Write-Host "Done. In GitHub: Settings -> Pages -> Deploy from branch gh-pages -> / (root)"
