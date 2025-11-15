# WhatsApp Chat Application - Complete Setup Guide

## 🚀 Full Working Application with Video & Voice Calls

This is a complete WhatsApp-like chat application with real-time messaging, video calls, and voice calls.

## 📋 Prerequisites

- Node.js (v14 or higher)
- MongoDB (running locally or MongoDB Atlas)
- Modern web browser with camera/microphone access

## 🛠️ Quick Start (Windows)

### Option 1: Automated Setup
1. Double-click `start-all-servers.bat`
2. Wait for all servers to start
3. Open http://localhost:3000 in your browser

### Option 2: Manual Setup

#### 1. Start Backend Server
```bash
# In the main directory
npm install
npm start
```

#### 2. Start PeerJS Server (for video/voice calls)
```bash
# In a new terminal, in the main directory
node peer-server.js
```

#### 3. Start Frontend Server
```bash
# In a new terminal, in the frontend directory
cd frontend
npm install
npm start
```

## 🛠️ Quick Start (Linux/Mac)

### Option 1: Automated Setup
```bash
chmod +x start-all-servers.sh
./start-all-servers.sh
```

### Option 2: Manual Setup
Same as Windows, but use separate terminal windows.

## 🌐 Server URLs

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **PeerJS Server**: http://localhost:3001

## 🔧 Configuration

### Backend Configuration
The backend is configured with:
- CORS enabled for frontend communication
- Socket.IO for real-time messaging
- JWT authentication
- MongoDB connection

### Frontend Configuration
The frontend includes:
- React 18 with hooks
- Tailwind CSS for styling
- Socket.IO client for real-time communication
- PeerJS for video/voice calls
- React Router for navigation

## 📱 Features

### ✅ Authentication
- User registration and login
- JWT token-based authentication
- Protected routes

### ✅ Real-time Chat
- Send and receive messages instantly
- Message status (sent, delivered, read)
- Online/offline status
- Typing indicators

### ✅ Video Calls
- High-quality video calls
- Camera on/off toggle
- Microphone mute/unmute
- Picture-in-picture local video

### ✅ Voice Calls
- Audio-only calls
- Microphone controls
- Call quality optimization

### ✅ User Management
- Contact management
- User search
- Profile management

## 🎯 How to Test Video/Voice Calls

1. **Register two users**:
   - Go to http://localhost:3000/register
   - Create two different accounts

2. **Start a call**:
   - Login with first user
   - Navigate to chats
   - Start a video or voice call with another user

3. **Accept the call**:
   - Login with second user in another browser/incognito
   - Accept the incoming call

## 🔧 Troubleshooting

### Common Issues

1. **CORS Errors**
   - Ensure backend server is running on port 5000
   - Check that CORS is properly configured in app.js

2. **Socket.IO Connection Failed**
   - Verify backend server is running
   - Check browser console for connection errors

3. **Video/Audio Not Working**
   - Ensure PeerJS server is running on port 3001
   - Check browser permissions for camera/microphone
   - Try in incognito mode to avoid permission issues

4. **Database Connection Issues**
   - Ensure MongoDB is running
   - Check database connection string in config

### Port Conflicts

If ports are in use:
- Backend: Change PORT in app.js
- Frontend: Change port in package.json scripts
- PeerJS: Change PORT in peer-server.js

## 📁 Project Structure

```
whatsapp/
├── app.js                 # Main backend server
├── peer-server.js         # PeerJS server for video calls
├── start-all-servers.bat  # Windows startup script
├── start-all-servers.sh   # Linux/Mac startup script
├── frontend/              # React frontend
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── contexts/      # React contexts
│   │   └── services/      # API services
│   └── package.json
└── models/                # Database models
```

## 🚀 Production Deployment

For production deployment:

1. **Environment Variables**:
   - Set production database URL
   - Configure JWT secrets
   - Set up proper CORS origins

2. **Build Frontend**:
   ```bash
   cd frontend
   npm run build
   ```

3. **Serve Static Files**:
   - Configure backend to serve built React app
   - Set up reverse proxy for production

## 🎉 Success!

Once all servers are running:
1. Open http://localhost:3000
2. Register a new account
3. Test messaging and video/voice calls
4. Enjoy your WhatsApp-like chat application!

## 📞 Support

If you encounter any issues:
1. Check all servers are running
2. Verify browser console for errors
3. Ensure camera/microphone permissions are granted
4. Try different browsers if needed

Happy chatting! 🎊
