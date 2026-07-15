# Builds the SvelteKit UI for the desktop app (Rust/Tauri or Python) into ui_build/.
$ErrorActionPreference = "Stop"
$repoRoot = Split-Path -Parent $PSScriptRoot

Set-Content -Path (Join-Path $repoRoot "ui/.env") -Value "PUBLIC_WS_URL=127.0.0.1:5174/ws`nPUBLIC_DESKTOP_MODE=true"

Push-Location (Join-Path $repoRoot "ui")
try {
    $useBun = $null -ne (Get-Command "bun" -ErrorAction SilentlyContinue)
    if ($useBun) {
        Write-Host "Using bun to install and build..."
        bun install
        if ($LASTEXITCODE -ne 0) { throw "bun install failed" }
        bun run build
        if ($LASTEXITCODE -ne 0) { throw "bun run build failed" }
    } else {
        Write-Host "bun not found. Using npm to install and build..."
        npm install
        if ($LASTEXITCODE -ne 0) { throw "npm install failed" }
        npm run build
        if ($LASTEXITCODE -ne 0) { throw "npm run build failed" }
    }
}
finally {
    Pop-Location
}

Write-Host "Desktop UI built to $(Join-Path $repoRoot 'ui_build')"
