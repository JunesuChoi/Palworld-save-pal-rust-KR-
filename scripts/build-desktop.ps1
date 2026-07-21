# Builds the Windows desktop artifacts into dist/:
#   PalworldSavePal-<version>-windows.msi              MSI installer
#   PalworldSavePal-<version>-windows-standalone.zip   portable (psp.exe + ui_build + data)
#
# The portable build runs extract-and-run: launch psp.exe from the
# extracted folder — it serves the bundled ui_build/ and keeps its psp-rs.db
# alongside the exe. Requires the Microsoft Edge WebView2 runtime (present on
# up-to-date Windows 10/11).
#
# Usage: .\scripts\build-desktop.ps1 [-SkipUi]   (-SkipUi if ui_build is current)
param([switch]$SkipUi)
$ErrorActionPreference = "Stop"
$repoRoot = Split-Path -Parent $PSScriptRoot
Set-Location $repoRoot

# Ensure cargo is in PATH
if ($env:PATH -notlike "*C:\Users\trsy\.cargo\bin*") {
    $env:PATH += ";C:\Users\trsy\.cargo\bin"
}

$tauriCmd = "cargo"
$tauriArgs = @("tauri", "build", "--bundles", "nsis")

# Safely check if tauri cargo command is available without triggering stderr errors
$cargoList = cargo --list
$hasTauri = $false
foreach ($line in $cargoList) {
    if ($line -like "*tauri*") {
        $hasTauri = $true
        break
    }
}

if (-not (Get-Command "cargo-tauri" -ErrorAction SilentlyContinue) -and -not $hasTauri) {
    Write-Host "cargo-tauri not found. Falling back to npx @tauri-apps/cli..."
    $tauriCmd = "npx"
    $tauriArgs = @("@tauri-apps/cli", "build", "--bundles", "nsis")
}

$version = (Select-String -Path "Cargo.toml" -Pattern '^version = "([^"]*)"').Matches[0].Groups[1].Value
Write-Host "Building Palworld Save Pal desktop v$version (windows)"

if (-not $SkipUi) {
    & (Join-Path $PSScriptRoot "build-ui-desktop.ps1")
}

Push-Location "psp-desktop"
try {
    & $tauriCmd $tauriArgs
    if ($LASTEXITCODE -ne 0) { throw "$tauriCmd build failed" }
}
finally { Pop-Location }

$dist = Join-Path $repoRoot "dist"
New-Item -ItemType Directory -Force -Path $dist | Out-Null

# EXE installer.
$nsis = Get-ChildItem "target/release/bundle/nsis/*.exe" | Sort-Object LastWriteTime -Descending | Select-Object -First 1
Copy-Item $nsis.FullName (Join-Path $dist "PalworldSavePal-KR-$version-windows-installer.exe")

# Portable standalone: exe + ui_build + data in one folder, zipped.
$staging = Join-Path $dist "PalworldSavePal-KR"
if (Test-Path $staging) { Remove-Item -Recurse -Force $staging }
New-Item -ItemType Directory -Force -Path $staging | Out-Null
Copy-Item "target/release/psp.exe" (Join-Path $staging "psp.exe")
Copy-Item -Recurse "ui_build" (Join-Path $staging "ui_build")
Copy-Item -Recurse "data" (Join-Path $staging "data")

$zip = Join-Path $dist "PalworldSavePal-KR-$version-windows-standalone.zip"
if (Test-Path $zip) { Remove-Item -Force $zip }
Compress-Archive -Path $staging -DestinationPath $zip
Remove-Item -Recurse -Force $staging

Write-Host "Done. Artifacts in dist/:"
Get-ChildItem $dist -Filter "PalworldSavePal-KR-$version-windows*" | ForEach-Object { Write-Host "  $($_.Name)" }
