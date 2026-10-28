# CloudGuard AI - Unified Launch Script
Write-Host "====================================================" -ForegroundColor Cyan
Write-Host "🛡️  Starting CloudGuard AI Full-Stack Platform..." -ForegroundColor Cyan
Write-Host "====================================================" -ForegroundColor Cyan

# 1. Start Python AI Microservice in background
Write-Host "[1/3] Starting Python AI Anomaly Service on port 8000..." -ForegroundColor Yellow
Start-Process -FilePath "powershell.exe" -ArgumentList "-NoExit", "-Command", "cd 'ai-service'; python run.py"

Start-Sleep -Seconds 2

# 2. Start Express Backend
Write-Host "[2/3] Starting Express.js Backend on port 5000..." -ForegroundColor Yellow
Start-Process -FilePath "powershell.exe" -ArgumentList "-NoExit", "-Command", "cd 'server'; npm start"

Start-Sleep -Seconds 2

# 3. Start React Frontend
Write-Host "[3/3] Starting React Vite Frontend on port 5173..." -ForegroundColor Green
Start-Process -FilePath "powershell.exe" -ArgumentList "-NoExit", "-Command", "cd 'client'; npm run dev"

Write-Host "====================================================" -ForegroundColor Cyan
Write-Host "✅ CloudGuard AI successfully launched!" -ForegroundColor Green
Write-Host "🌐 Frontend: http://localhost:5173" -ForegroundColor White
Write-Host "📡 Backend:  http://localhost:5000" -ForegroundColor White
Write-Host "🧠 AI Engine: http://127.0.0.1:8000" -ForegroundColor White
Write-Host "====================================================" -ForegroundColor Cyan
