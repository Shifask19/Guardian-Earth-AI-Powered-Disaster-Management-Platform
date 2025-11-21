@echo off
echo ==========================================
echo Guardian Earth AI - Quick Start
echo ==========================================
echo.

REM Check Python version
python --version

REM Install dependencies
echo.
echo Installing dependencies...
pip install -r requirements.txt

REM Train models
echo.
echo Training AI models (this may take 10-25 minutes)...
python train_models.py

REM Start server
echo.
echo Starting prediction server...
python prediction_server.py
