const { ExpressPeerServer } = require('peer');
const express = require('express');
const app = express();
const server = require('http').Server(app);

// Enable CORS
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
});

// Create PeerJS server with proper configuration
const peerServer = ExpressPeerServer(server, {
    debug: true,
    path: '/',
    proxied: true,
    allow_discovery: true,
    ssl: false,
    port: 3001,
    corsOptions: {
        origin: '*',
        methods: ['GET', 'POST']
    }
});

// Use PeerJS server
app.use('/', peerServer);

// Start server
const PORT = 3001;
const HOST = '0.0.0.0'; // Bind to all network interfaces
server.listen(PORT, HOST, () => {
    console.log(`PeerJS server is running on http://${HOST}:${PORT}`);
    console.log(`PeerJS accessible from network at: http://[YOUR_IP]:${PORT}`);
});

// Handle server events
peerServer.on('connection', (client) => {
    console.log('Client connected:', client.id);
});

peerServer.on('disconnect', (client) => {
    console.log('Client disconnected:', client.id);
});

// Error handling
server.on('error', (error) => {
    console.error('Server error:', error);
});