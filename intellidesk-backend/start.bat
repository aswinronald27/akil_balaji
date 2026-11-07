@echo off
title IntelliDesk - Fullstack Website & Backend Server
echo ========================================================
echo        IntelliDesk Smart Incident Management Platform
echo ========================================================
echo.

cd /d "%~dp0"

where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [WARNING] Node.js is not found in your PATH.
    echo Opening standalone website directly in browser...
    start "" "%~dp0IntelliDesk-Website.html"
    pause
    exit /b 0
)

if not exist node_modules (
    echo [INFO] Installing backend dependencies...
    call npm install
)

echo [INFO] Starting Live Fullstack Server (Backend API + Website)...
echo [INFO] Website URL:   http://localhost:3000
echo [INFO] Backend API:   http://localhost:3000/api/v1
echo.

start /b "" cmd /c "timeout /t 2 /nobreak >nul && start http://localhost:3000"
node server.js
