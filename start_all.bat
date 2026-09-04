@echo off
echo ===================================================
echo   Starting LandSetu Unified Governance Platform
echo ===================================================

echo [1/3] Launching Python AI Microservice (Port 5001)...
start "LandSetu AI Service (5001)" cmd /k "cd /d %~dp0 && python -m uvicorn ai.server:app --host 127.0.0.1 --port 5001"

timeout /t 2 /nobreak >nul

echo [2/3] Launching Node.js Backend API (Port 5000)...
start "LandSetu Backend (5000)" cmd /k "cd /d %~dp0backend && npm run dev"

timeout /t 2 /nobreak >nul

echo [3/3] Launching Vite Frontend UI (Port 3001)...
start "LandSetu Frontend (3001)" cmd /k "cd /d %~dp0frontend && npm run dev -- --port 3001"

echo ===================================================
echo All 3 services triggered!
echo AI Service:   http://127.0.0.1:5001/health
echo Backend API:  http://127.0.0.1:5000/health
echo Frontend UI:  http://localhost:3001/
echo ===================================================
pause
