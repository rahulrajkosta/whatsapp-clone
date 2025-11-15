#!/bin/bash

echo "Starting WhatsApp Chat Application with Video/Voice Calls"
echo "====================================================="

echo ""
echo "Starting Backend Server (Port 5000)..."
gnome-terminal -- bash -c "cd $(dirname "$0") && npm start; exec bash" &

echo ""
echo "Starting PeerJS Server (Port 3001)..."
gnome-terminal -- bash -c "cd $(dirname "$0") && node peer-server.js; exec bash" &

echo ""
echo "Starting Frontend Server (Port 3000)..."
gnome-terminal -- bash -c "cd $(dirname "$0")/frontend && npm start; exec bash" &

echo ""
echo "All servers are starting..."
echo ""
echo "Backend API: http://localhost:5000"
echo "PeerJS Server: http://localhost:3001"
echo "Frontend: http://localhost:3000"
echo ""
echo "Wait for all servers to start, then open http://localhost:3000 in your browser"
echo ""
