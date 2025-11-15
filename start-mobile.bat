@echo off
echo Starting WhatsApp Chat Application for Mobile Access
echo ==================================================

echo.
echo Your computer's IP address: 10.123.215.217
echo.
echo Starting Backend Server (Port 5000)...
start "Backend" cmd /k "cd /d %~dp0 && npm start"

echo.
echo Starting PeerJS Server (Port 3001)...
start "PeerJS" cmd /k "cd /d %~dp0 && node peer-server.js"

echo.
echo Starting Frontend Server (Port 3000)...
start "Frontend" cmd /k "cd /d %~dp0\frontend && npm start"

echo.
echo All servers are starting...
echo.
echo ================================================
echo MOBILE ACCESS URLs:
echo ================================================
echo Frontend: http://10.123.215.217:3000
echo Backend API: http://10.123.215.217:5000
echo PeerJS Server: http://10.123.215.217:3001
echo.
echo To access from your phone:
echo 1. Make sure your phone is on the same WiFi network
echo 2. Open browser on phone and go to: http://10.123.215.217:3000
echo 3. Register and login normally
echo.
echo ================================================
pause
