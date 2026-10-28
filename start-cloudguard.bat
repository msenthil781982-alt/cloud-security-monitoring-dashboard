@echo off
echo ====================================================
echo 🛡️  Starting CloudGuard AI Full-Stack Platform...
echo ====================================================

echo [1/3] Starting Python AI Anomaly Service on port 8000...
start cmd /k "cd ai-service && python run.py"

timeout /t 2 /nobreak >nul

echo [2/3] Starting Express.js Backend on port 5000...
start cmd /k "cd server && npm start"

timeout /t 2 /nobreak >nul

echo [3/3] Starting React Vite Frontend on port 5173...
start cmd /k "cd client && npm run dev"

echo ====================================================
echo ✅ CloudGuard AI launched!
echo 🌐 Frontend: http://localhost:5173
echo 📡 Backend:  http://localhost:5000
echo 🧠 AI Engine: http://127.0.0.1:8000
echo ====================================================
pause
