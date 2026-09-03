@echo off
echo ===================================================
echo  Training LandSetu AI Machine Learning Models...
echo ===================================================
cd /d "%~dp0\..\.."
python ai/train.py
pause
