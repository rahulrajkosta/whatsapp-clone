# WhatsApp Clone - Complete Frontend Setup

This document provides a complete guide for setting up the React frontend for your WhatsApp-like chat application.

## 🎯 Overview

The frontend is a modern React application that provides:

- **Real-time messaging** with Socket.IO
- **Video/Voice calls** with WebRTC
- **Responsive design** with Tailwind CSS
- **Authentication** with JWT tokens
- **File sharing** capabilities
- **Modern UI/UX** similar to WhatsApp

## 🚀 Quick Start

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Backend server running on port 5000

### Installation

1. **Run the setup script:**
   ```bash
   # On Windows
   setup-frontend.bat
   
   # On Linux/Mac
   chmod +x setup-frontend.sh
   ./setup-frontend.sh
   ```

2. **Or manually:**
   ```bash
   cd frontend
   npm install
   cp env.example .env
   npm install date-fns
   ```

3. **Start the development server:**
   ```bash
   cd frontend
   npm start
   ```

The app will be available at [http://localhost:3000](http://localhost:3000).

## 📁 Project Structure

```
frontend/
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   ├── auth/
│   │   │   ├── Login.js
│   │   │   └── Register.js
│   │   ├── chat/
│   │   │   ├── ChatList.js
│   │   │   ├── ChatWindow.js
│   │   │   ├── MessageList.js
│   │   │   └── TypingIndicator.js
│   │   └── call/
│   │       └── CallScreen.js
│   ├── contexts/
│   │   ├── AuthContext.js
│   │   └── SocketContext.js
│   ├── services/
│   │   └── api.js
│   ├── App.js
│   ├── App.css
│   ├── index.js
│   └── index.css
├── package.json
├── tailwind.config.js
├── postcss.config.js
└── README.md
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the frontend directory:

```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_SERVER_URL=http://localhost:5000
```

### Tailwind CSS

The project uses Tailwind CSS with custom WhatsApp colors:

```javascript
// tailwind.config.js
colors: {
  whatsapp: {
    green: '#25D366',
    dark: '#075E54',
    light: '#DCF8C6',
    blue: '#34B7F1'
  }
}
```

## 🎨 Features

### Authentication
- ✅ Login/Register forms
- ✅ JWT token management
- ✅ Protected routes
- ✅ Auto-logout on token expiry

### Chat Features
- ✅ Real-time messaging
- ✅ Typing indicators
- ✅ Message status (sent/delivered/read)
- ✅ File sharing (images, videos, documents)
- ✅ Message reactions
- ✅ Reply to messages
- ✅ Online/offline status

### Call Features
- ✅ Video calls with WebRTC
- ✅ Voice calls
- ✅ Call controls (mute, video toggle)
- ✅ Picture-in-picture for local video

### UI/UX
- ✅ WhatsApp-like design
- ✅ Responsive layout
- ✅ Smooth animations
- ✅ Mobile-optimized
- ✅ Custom scrollbars
- ✅ Loading states

## 🔌 API Integration

### REST API Endpoints

The frontend integrates with these backend endpoints:

- `POST /api/auth` - Login
- `POST /api/auth/register` - Register
- `GET /api/auth` - Get current user
- `GET /api/chats` - Get chat list
- `GET /api/chats/:id` - Get specific chat
- `GET /api/chats/:id/messages` - Get messages
- `POST /api/chats/:id/messages` - Send message

### Socket.IO Events

Real-time communication through these events:

- `send_message` - Send a new message
- `new_message` - Receive new message
- `typing` - User is typing
- `stop_typing` - User stopped typing
- `user_status_changed` - User online/offline status

## 🛠️ Development

### Available Scripts

```bash
npm start          # Start development server
npm build          # Build for production
npm test           # Run tests
npm eject          # Eject from Create React App
```

### Key Dependencies

```json
{
  "react": "^18.2.0",
  "react-router-dom": "^6.8.1",
  "socket.io-client": "^4.8.1",
  "axios": "^1.3.4",
  "peerjs": "^1.4.7",
  "react-icons": "^4.7.1",
  "tailwindcss": "^3.2.7",
  "date-fns": "^2.29.3"
}
```

## 🎯 Component Architecture

### Context Providers

- **AuthContext** - Manages user authentication state
- **SocketContext** - Handles Socket.IO connection

### Key Components

- **Login/Register** - Authentication forms
- **ChatList** - List of all chats
- **ChatWindow** - Individual chat interface
- **MessageList** - Display messages
- **CallScreen** - Video/voice call interface

## 🚀 Deployment

### Build for Production

```bash
cd frontend
npm run build
```

The build files will be in the `build/` directory.

### Environment Variables for Production

Update your production environment variables:

```env
REACT_APP_API_URL=https://your-api-domain.com/api
REACT_APP_SERVER_URL=https://your-api-domain.com
```

## 🔧 Troubleshooting

### Common Issues

1. **Socket.IO connection failed**
   - Check if backend server is running
   - Verify REACT_APP_SERVER_URL in .env

2. **API calls failing**
   - Check if backend server is running on port 5000
   - Verify REACT_APP_API_URL in .env

3. **Video calls not working**
   - Ensure HTTPS in production
   - Check browser permissions for camera/microphone

4. **Styling issues**
   - Run `npm install` to ensure Tailwind CSS is properly installed
   - Check if Tailwind config is correct

### Development Tips

- Use React Developer Tools for debugging
- Check browser console for Socket.IO connection status
- Use Network tab to monitor API calls
- Test on different screen sizes for responsiveness

## 📱 Mobile Support

The app is fully responsive and works on:

- ✅ Desktop browsers
- ✅ Mobile browsers
- ✅ Progressive Web App (PWA) ready
- ✅ Touch gestures support

## 🎨 Customization

### Colors

Update `tailwind.config.js` to customize colors:

```javascript
colors: {
  whatsapp: {
    green: '#25D366',    // Primary green
    dark: '#075E54',     // Dark green
    light: '#DCF8C6',    // Light green
    blue: '#34B7F1'      // Blue accent
  }
}
```

### Fonts

The app uses system fonts for better performance. To add custom fonts:

1. Add font files to `public/fonts/`
2. Update `index.css` with `@font-face`
3. Configure in `tailwind.config.js`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

---

## 🎉 You're All Set!

Your React frontend is now ready. Start the development server and begin building your WhatsApp clone!

```bash
cd frontend
npm start
```

Happy coding! 🚀
