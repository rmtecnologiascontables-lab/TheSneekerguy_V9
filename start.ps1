#! /usr/bin/env pwsh

param(
    [switch]$SkipOllama
)

$ErrorActionPreference = "Continue"

Write-Host "🚀 Iniciando SneekerGuy App..." -ForegroundColor Cyan

# Start Ollama if not skipped and available
if (-not $SkipOllama) {
    $ollamaPath = Get-Command ollama -ErrorAction SilentlyContinue
    if ($ollamaPath) {
        Write-Host "📦 Iniciando Ollama..." -ForegroundColor Yellow
        Start-Process -FilePath "ollama" -ArgumentList "serve" -WindowStyle Hidden
        Start-Sleep -Seconds 2
        Write-Host "✅ Ollama iniciado" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Ollama no instalado. Instalar desde: https://ollama.com" -ForegroundColor Yellow
    }
} else {
    Write-Host "⏭️  Ollama omitido" -ForegroundColor Gray
}

# Start the app server
Write-Host "🌐 Iniciando servidor de la app..." -ForegroundColor Yellow

# Kill existing process on port 3000
Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue | ForEach-Object {
    Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue
}
Start-Sleep -Seconds 1

# Start the app
npm run dev

Write-Host "✅ Servidor corriendo en http://localhost:3000" -ForegroundColor Green