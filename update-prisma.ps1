# Update Prisma Client Script
# This script stops the dev server, updates Prisma, and restarts

Write-Host "🔴 Stopping Next.js dev server..." -ForegroundColor Red
# Kill all node processes running on port 4002
$processes = Get-NetTCPConnection -LocalPort 4002 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique
foreach ($proc in $processes) {
    Stop-Process -Id $proc -Force -ErrorAction SilentlyContinue
}

Start-Sleep -Seconds 2

Write-Host "🔧 Generating Prisma Client..." -ForegroundColor Yellow
npx prisma generate

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Prisma Client updated successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "▶️  Now run: npm run dev" -ForegroundColor Cyan
} else {
    Write-Host "❌ Failed to update Prisma Client" -ForegroundColor Red
}
