const http = require('http');

const ip = '10.123.215.217';
const port = 5000;

console.log(`Testing mobile connectivity to backend...`);
console.log(`Backend URL: http://${ip}:${port}`);
console.log(`API URL: http://${ip}:${port}/api/auth`);
console.log('');

// Test backend connectivity
const testBackend = () => {
    return new Promise((resolve) => {
        const req = http.get(`http://${ip}:${port}/api/auth`, (res) => {
            console.log(`✅ Backend is accessible from network`);
            console.log(`   Status: ${res.statusCode}`);
            console.log(`   Headers:`, res.headers);
            resolve(true);
        });
        
        req.on('error', (err) => {
            console.log(`❌ Backend is NOT accessible from network`);
            console.log(`   Error: ${err.message}`);
            console.log(`   Code: ${err.code}`);
            resolve(false);
        });
        
        req.setTimeout(10000, () => {
            console.log(`❌ Backend connection timeout`);
            req.destroy();
            resolve(false);
        });
    });
};

// Test if port is listening
const testPort = () => {
    return new Promise((resolve) => {
        const net = require('net');
        const socket = new net.Socket();
        
        socket.setTimeout(5000);
        
        socket.on('connect', () => {
            console.log(`✅ Port ${port} is open and listening`);
            socket.destroy();
            resolve(true);
        });
        
        socket.on('error', (err) => {
            console.log(`❌ Port ${port} is not accessible`);
            console.log(`   Error: ${err.message}`);
            resolve(false);
        });
        
        socket.on('timeout', () => {
            console.log(`❌ Port ${port} connection timeout`);
            socket.destroy();
            resolve(false);
        });
        
        socket.connect(port, ip);
    });
};

async function runTests() {
    console.log('🔍 Running connectivity tests...\n');
    
    const portOk = await testPort();
    console.log('');
    
    if (portOk) {
        const backendOk = await testBackend();
        console.log('');
        
        if (backendOk) {
            console.log('🎉 Backend is accessible from mobile!');
            console.log(`📱 Use this URL on your phone: http://${ip}:3000`);
        } else {
            console.log('❌ Backend is running but not responding to HTTP requests');
            console.log('   This might be a CORS or server configuration issue');
        }
    } else {
        console.log('❌ Backend port is not accessible');
        console.log('   Possible causes:');
        console.log('   1. Backend server is not running');
        console.log('   2. Windows Firewall is blocking the port');
        console.log('   3. Server is not binding to 0.0.0.0');
        console.log('   4. Network connectivity issues');
    }
}

runTests();
