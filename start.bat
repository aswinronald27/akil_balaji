@echo off
title IntelliDesk - Smart IT Incident Intelligence Platform
echo ========================================================
echo   IntelliDesk - Smart IT Incident Intelligence Platform
echo                 Fullstack Application
echo ========================================================
echo.

cd /d "%~dp0intellidesk-backend"

where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [WARNING] Node.js is not found in your PATH.
    echo Opening standalone web interface directly in your default browser...
    start "" "%~dp0frontend\IntelliDesk-Direct.html"
    pause
    exit /b 0
)

if not exist node_modules (
    echo [INFO] Installing backend dependencies...
    call npm install
)

echo [INFO] Starting Fullstack Server (Backend API + Live React Frontend)...
echo [INFO] Web Application: http://localhost:3000
echo [INFO] Backend API:     http://localhost:3000/api/v1
echo [INFO] Health Check:    http://localhost:3000/api/health
echo.

start /b "" cmd /c "timeout /t 2 /nobreak >nul && start http://localhost:3000"
node server.js

