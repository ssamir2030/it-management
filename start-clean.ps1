# Clean and Restart Development Server
Write-Host "🧹 Cleaning Next.js cache..." -ForegroundColor Yellow
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
Write-Host "✅ Cache cleaned!" -ForegroundColor Green

Write-Host "`n📝 Environment Variables Check:" -ForegroundColor Cyan
if (Test-Path .env) {
    $envContent = Get-Content .env
    $hasSecret = $envContent | Select-String "NEXTAUTH_SECRET"
    $hasUrl = $envContent | Select-String "NEXTAUTH_URL"
    
    if ($hasSecret) {
        Write-Host "✅ NEXTAUTH_SECRET found" -ForegroundColor Green
    }
    else {
        Write-Host "❌ NEXTAUTH_SECRET missing!" -ForegroundColor Red
    }
    
    if ($hasUrl) {
        Write-Host "✅ NEXTAUTH_URL found" -ForegroundColor Green
    }
    else {
        Write-Host "❌ NEXTAUTH_URL missing!" -ForegroundColor Red
    }
}
else {
    Write-Host "❌ .env file not found!" -ForegroundColor Red
}

Write-Host "`n🔐 Login Credentials:" -ForegroundColor Magenta
Write-Host "Email:    admin@system.com" -ForegroundColor White
Write-Host "Password: password" -ForegroundColor White

Write-Host ""
Write-Host "🚀 Starting development server on port 4002..." -ForegroundColor Cyan
Write-Host "📍 Login page: http://localhost:4002/login" -ForegroundColor Yellow
Write-Host "🛠️  Debug API: http://localhost:4002/api/debug" -ForegroundColor Yellow
Write-Host ""
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Gray
Write-Host ""

npm run dev
