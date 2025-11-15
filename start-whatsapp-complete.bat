@echo off
echo Starting Complete WhatsApp Chat Application
echo ==========================================

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
echo WHATSAPP-LIKE FEATURES:
echo ================================================
echo ✅ Real-time messaging with typing indicators
echo ✅ Video calls with accept/reject functionality
echo ✅ Voice calls with accept/reject functionality
echo ✅ Call notifications like WhatsApp
echo ✅ Online/offline status
echo ✅ Message delivery status
echo.
echo ================================================
echo ACCESS URLs:
echo ================================================
echo Computer: http://localhost:3000
echo Mobile: http://10.123.215.217:3000
echo Backend API: http://10.123.215.217:5000
echo PeerJS Server: http://10.123.215.217:3001
echo.
echo ================================================
echo HOW TO TEST CALLS:
echo ================================================
echo 1. Open two browsers (or one computer + one phone)
echo 2. Register different users in each browser
echo 3. Start a chat between users
echo 4. Click video/phone icons to initiate calls
echo 5. Other user will see incoming call notification
echo 6. Accept/reject calls like WhatsApp!
echo.
echo ================================================
pause
