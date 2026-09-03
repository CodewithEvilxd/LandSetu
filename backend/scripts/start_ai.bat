@echo off
echo ===================================================
echo  Starting LandSetu Python AI Agent Microservice...
echo ===================================================
cd /d "%~dp0\..\.."
python -m uvicorn ai.server:app --host 127.0.0.1 --port 5001 --reload
pause
