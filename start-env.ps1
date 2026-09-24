# ============================================================
# Inzovate Enterprise ERP — Production Environment Starter
# ============================================================

Write-Host "🚀 Launching Inzovate Enterprise ERP Services..." -ForegroundColor Cyan

# 1. Check if Docker daemon is running
$dockerRunning = $false
try {
    $info = docker info 2>&1
    if ($LASTEXITCODE -eq 0) {
        $dockerRunning = $true
    }
} catch {
    $dockerRunning = $false
}

if (-not $dockerRunning) {
    Write-Host "⏳ Starting Docker Desktop daemon..." -ForegroundColor Yellow
    if (Test-Path "C:\Program Files\Docker\Docker\Docker Desktop.exe") {
        Start-Process "C:\Program Files\Docker\Docker\Docker Desktop.exe"
        Write-Host "Waiting for Docker daemon to initialize (up to 30s)..." -ForegroundColor Yellow
        $retries = 30
        while ($retries -gt 0) {
            Start-Sleep -Seconds 2
            $check = docker info 2>&1
            if ($LASTEXITCODE -eq 0) {
                $dockerRunning = $true
                break
            }
            $retries--
        }
    } else {
        Write-Host "⚠ Docker Desktop not found in standard location. Please start your PostgreSQL database manually." -ForegroundColor Red
    }
}

if ($dockerRunning) {
    Write-Host "✔ Docker daemon active. Spinning up PostgreSQL & Redis containers..." -ForegroundColor Green
    docker compose up -d
    Start-Sleep -Seconds 3

    Write-Host "✔ Running Prisma database migration..." -ForegroundColor Green
    npx prisma migrate dev --name init --schema=apps/backend/prisma/schema.prisma

    Write-Host "✔ Seeding database with 9 enterprise roles, verified journals, projects & QC records..." -ForegroundColor Green
    npm run db:seed --prefix apps/backend
} else {
    Write-Host "⚠ Docker daemon is not active. If you have an external PostgreSQL instance, configure DATABASE_URL in apps/backend/.env and run:" -ForegroundColor Yellow
    Write-Host "   npx prisma migrate dev --schema=apps/backend/prisma/schema.prisma" -ForegroundColor White
    Write-Host "   npm run db:seed --prefix apps/backend" -ForegroundColor White
}

Write-Host "`n🌟 Starting full-stack development servers (Turbo)..." -ForegroundColor Cyan
npm run dev
