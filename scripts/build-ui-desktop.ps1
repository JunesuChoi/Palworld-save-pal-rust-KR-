# Builds the SvelteKit UI for the desktop app (Rust/Tauri or Python) into ui_build/.
# The desktop env (PUBLIC_DESKTOP_MODE=true) and the build are owned by the
# ui `build:desktop` script so local, CI, and Tauri's beforeBuildCommand agree.
$ErrorActionPreference = "Stop"
$repoRoot = Split-Path -Parent $PSScriptRoot

Push-Location (Join-Path $repoRoot "ui")
try {
    $useBun = $null -ne (Get-Command "bun" -ErrorAction SilentlyContinue)
    if ($useBun) {
        Write-Host "Using bun to install and build..."
        bun install
        if ($LASTEXITCODE -ne 0) { throw "bun install failed" }
        bun run build:desktop
        if ($LASTEXITCODE -ne 0) { throw "bun run build:desktop failed" }
    } else {
        Write-Host "bun not found. Using npm to install and build..."
        npm install
        if ($LASTEXITCODE -ne 0) { throw "npm install failed" }
        npm run build:desktop
        if ($LASTEXITCODE -ne 0) { throw "npm run build:desktop failed" }
    }
}
finally {
    Pop-Location
}

Write-Host "Desktop UI built to $(Join-Path $repoRoot 'ui_build')"
