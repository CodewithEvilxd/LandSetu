@echo off
echo ===================================================
echo  Starting LandSetu Autonomous Platform Services...
echo ===================================================

echo [1/3] Launching Python AI Agent Microservice (Port 5001)...
start "LandSetu - Python AI Agent" cmd /c "%~dp0start_ai.bat"

timeout /t 2 /nobreak >nul

echo [2/3] Launching Node.js Backend API Server (Port 5000)...
start "LandSetu - Node.js Backend API" cmd /c "%~dp0start_backend.bat"

timeout /t 2 /nobreak >nul

echo [3/3] Launching React Web Application (Port 3000)...
start "LandSetu - React Frontend" cmd /c "%~dp0start_frontend.bat"

echo ===================================================
echo  All services launched in separate windows!
echo  Web UI: http://localhost:3000
echo  API:    http://localhost:5000
echo  AI:     http://localhost:5001
echo ===================================================
