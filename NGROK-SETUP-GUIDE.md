# 🌐 Ngrok Setup Guide for WhatsApp Clone

## 🚀 **Quick Setup for Ngrok**

### **Step 1: Install Ngrok**
```bash
# Download from https://ngrok.com/download
# Or install via npm
npm install -g ngrok
```

### **Step 2: Start Your Backend Servers**
```bash
# Terminal 1: Start main server
npm start

# Terminal 2: Start PeerJS server  
node peer-server.js

# Terminal 3: Start frontend
cd frontend && npm start
```

### **Step 3: Create Ngrok Tunnels**
```bash
# Terminal 4: Create HTTPS tunnel for main server (port 5000)
ngrok http 5000

# Terminal 5: Create HTTPS tunnel for PeerJS server (port 3001)
ngrok http 3001
```

### **Step 4: Update Frontend URLs**
The frontend will automatically detect ngrok and use HTTPS URLs. No manual configuration needed!

## 📱 **Mobile Testing with Ngrok**

### **For Mobile Devices:**
1. **Get your ngrok URLs** from the ngrok dashboard
2. **Use HTTPS URLs** on mobile devices
3. **Example URLs:**
   - Frontend: `https://abc123.ngrok-free.dev`
   - Backend: `https://def456.ngrok-free.dev`
   - PeerJS: `https://ghi789.ngrok-free.dev`

### **Automatic Configuration:**
The app automatically detects ngrok and switches to HTTPS:
- ✅ **API calls** use HTTPS
- ✅ **Socket.IO** uses HTTPS  
- ✅ **PeerJS** uses HTTPS
- ✅ **No mixed content errors**

## 🔧 **Manual Configuration (if needed)**

### **Environment Variables:**
Create `.env.local` in frontend folder:
```env
REACT_APP_API_URL=https://your-ngrok-domain.ngrok-free.dev/api
REACT_APP_SERVER_URL=https://your-ngrok-domain.ngrok-free.dev
REACT_APP_PEER_SERVER_URL=https://your-peerjs-ngrok-domain.ngrok-free.dev
```

### **Backend CORS Configuration:**
The backend already supports ngrok domains. If you need to add specific domains:

```javascript
// In app.js
const corsOptions = {
  origin: [
    'http://localhost:3000',
    'https://*.ngrok-free.dev',
    'https://*.ngrok.io'
  ],
  credentials: true
};
```

## 🎯 **Testing Steps**

### **1. Test API Connection:**
- Go to: `https://your-ngrok-domain.ngrok-free.dev/mobile-test`
- Should show "✅ API Connection Successful"

### **2. Test Socket.IO:**
- Login to the app
- Check browser console for "Connected to server"
- Should see Socket.IO connection established

### **3. Test Call Flow:**
- Go to: `https://your-ngrok-domain.ngrok-free.dev/no-permission-call-test`
- Test call flow between devices
- Should work without mixed content errors

### **4. Test Camera/Microphone:**
- Go to: `https://your-ngrok-domain.ngrok-free.dev/permission-request`
- Should now work on mobile devices with HTTPS

## 🔍 **Troubleshooting**

### **Mixed Content Errors:**
- ✅ **Fixed**: App automatically uses HTTPS with ngrok
- ✅ **Fixed**: All API calls use HTTPS
- ✅ **Fixed**: Socket.IO uses HTTPS

### **CORS Errors:**
- ✅ **Fixed**: Backend allows ngrok domains
- ✅ **Fixed**: Credentials enabled

### **PeerJS Connection Issues:**
- ✅ **Fixed**: PeerJS uses HTTPS with ngrok
- ✅ **Fixed**: Secure flag set correctly

### **Mobile Camera Issues:**
- ✅ **Fixed**: HTTPS enables camera access on mobile
- ✅ **Fixed**: No more "MediaDevices API not supported" errors

## 📋 **Complete Ngrok Commands**

```bash
# Start all servers
npm start                    # Backend (port 5000)
node peer-server.js         # PeerJS (port 3001)  
cd frontend && npm start    # Frontend (port 3000)

# Create ngrok tunnels
ngrok http 5000             # Backend tunnel
ngrok http 3001             # PeerJS tunnel
ngrok http 3000             # Frontend tunnel (optional)
```

## 🎉 **Benefits of Ngrok Setup**

1. **✅ HTTPS**: Enables camera/microphone on mobile
2. **✅ No Mixed Content**: All requests use HTTPS
3. **✅ Mobile Access**: Works on any device with internet
4. **✅ Real-time**: Socket.IO and PeerJS work perfectly
5. **✅ Automatic**: No manual configuration needed

## 📱 **Test URLs (Replace with your ngrok domains)**

- **Main App**: `https://your-domain.ngrok-free.dev`
- **Mobile Test**: `https://your-domain.ngrok-free.dev/mobile-test`
- **Call Test**: `https://your-domain.ngrok-free.dev/no-permission-call-test`
- **Permission Test**: `https://your-domain.ngrok-free.dev/permission-request`

The app will automatically detect ngrok and use HTTPS URLs! 🚀✨
