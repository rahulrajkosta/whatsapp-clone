const os = require('os');

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
console.log(`Your computer's IP address: ${ip}`);
console.log(`Frontend URL: http://${ip}:3000`);
console.log(`Backend API: http://${ip}:5000`);
console.log(`PeerJS Server: http://${ip}:3001`);
