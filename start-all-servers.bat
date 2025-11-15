@echo off
echo Starting WhatsApp Chat Application with Video/Voice Calls
echo =====================================================

echo.
echo Starting Backend Server (Port 5000)...
start "Backend Server" cmd /k "cd /d %~dp0 && npm start"

echo.
echo Starting PeerJS Server (Port 3001)...
start "PeerJS Server" cmd /k "cd /d %~dp0 && node peer-server.js"

echo.
echo Starting Frontend Server (Port 3000)...
start "Frontend Server" cmd /k "cd /d %~dp0\frontend && npm start"

echo.
echo All servers are starting...
echo.
echo Backend API: http://localhost:5000
echo PeerJS Server: http://localhost:3001
echo Frontend: http://localhost:3000
echo.
echo Wait for all servers to start, then open http://localhost:3000 in your browser
echo.
pause
