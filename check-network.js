const os = require('os');
const http = require('http');

function getLocalIP() {
    const interfaces = os.networkInterfaces();
    
    for (const name of Object.keys(interfaces)) {
        for (const iface of interfaces[name]) {
            // Skip internal (loopback) addresses and IPv6
            if (iface.family === 'IPv4' && !iface.internal) {
                return iface.address;
            }
        }
    }
    return 'localhost';
}

const ip = getLocalIP();
console.log(`\n🔍 Network Diagnostic Report`);
console.log(`========================`);
console.log(`Your IP: ${ip}`);
console.log(`Frontend: http://${ip}:3000`);
console.log(`Backend: http://${ip}:5000`);
console.log(`PeerJS: http://${ip}:3001`);

// Test if backend is accessible
const testBackend = () => {
    return new Promise((resolve) => {
        const req = http.get(`http://${ip}:5000/api/auth`, (res) => {
            console.log(`✅ Backend (${ip}:5000): Accessible (Status: ${res.statusCode})`);
            resolve(true);
        });
        
        req.on('error', (err) => {
            console.log(`❌ Backend (${ip}:5000): Not accessible - ${err.message}`);
            resolve(false);
        });
        
        req.setTimeout(5000, () => {
            console.log(`❌ Backend (${ip}:5000): Timeout`);
            req.destroy();
            resolve(false);
        });
    });
};

// Test if PeerJS is accessible
const testPeerJS = () => {
    return new Promise((resolve) => {
        const req = http.get(`http://${ip}:3001`, (res) => {
            console.log(`✅ PeerJS (${ip}:3001): Accessible (Status: ${res.statusCode})`);
            resolve(true);
        });
        
        req.on('error', (err) => {
            console.log(`❌ PeerJS (${ip}:3001): Not accessible - ${err.message}`);
            resolve(false);
        });
        
        req.setTimeout(5000, () => {
            console.log(`❌ PeerJS (${ip}:3001): Timeout`);
            req.destroy();
            resolve(false);
        });
    });
};

async function runDiagnostics() {
    console.log(`\n🧪 Testing Server Connectivity...`);
    
    const backendOk = await testBackend();
    const peerJSOk = await testPeerJS();
    
    console.log(`\n📋 Summary:`);
    console.log(`Backend: ${backendOk ? '✅ Running' : '❌ Not Running'}`);
    console.log(`PeerJS: ${peerJSOk ? '✅ Running' : '❌ Not Running'}`);
    
    if (!backendOk) {
        console.log(`\n🔧 To fix backend issues:`);
        console.log(`1. Run: npm start`);
        console.log(`2. Check if port 5000 is free`);
        console.log(`3. Check Windows Firewall settings`);
    }
    
    if (!peerJSOk) {
        console.log(`\n🔧 To fix PeerJS issues:`);
        console.log(`1. Run: node peer-server.js`);
        console.log(`2. Check if port 3001 is free`);
    }
    
    console.log(`\n📱 For mobile access:`);
    console.log(`1. Make sure both devices are on same WiFi`);
    console.log(`2. Open http://${ip}:3000 on your phone`);
    console.log(`3. Check if your phone can ping ${ip}`);
}

runDiagnostics();
