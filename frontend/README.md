# WhatsApp Clone - React Frontend

A modern React frontend for the WhatsApp-like chat application.

## Features

- 🔐 **Authentication** - Login and registration with JWT
- 💬 **Real-time Chat** - Socket.IO integration for instant messaging
- 📱 **Responsive Design** - Mobile-first design with Tailwind CSS
- 🎥 **Video/Voice Calls** - WebRTC integration with PeerJS
- 🔔 **Real-time Notifications** - Live typing indicators and message status
- 📁 **File Sharing** - Support for images, videos, and documents
- 🎨 **Modern UI** - Clean and intuitive WhatsApp-like interface

## Tech Stack

- **React 18** - Modern React with hooks
- **React Router** - Client-side routing
- **Socket.IO Client** - Real-time communication
- **Axios** - HTTP client for API calls
- **Tailwind CSS** - Utility-first CSS framework
- **React Icons** - Icon library
- **PeerJS** - WebRTC for video/voice calls
- **date-fns** - Date utility library

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Backend server running on port 5000

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create environment file:
```bash
cp env.example .env
```

3. Update environment variables in `.env`:
```
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_SERVER_URL=http://localhost:5000
```

4. Start the development server:
```bash
npm start
```

The app will open at [http://localhost:3000](http://localhost:3000).

## Project Structure

```
src/
├── components/
│   ├── auth/           # Authentication components
│   ├── chat/           # Chat-related components
│   └── call/           # Video/voice call components
├── contexts/           # React contexts for state management
├── services/           # API service layer
└── App.js             # Main app component
```

## Available Scripts

- `npm start` - Start development server
- `npm build` - Build for production
- `npm test` - Run tests
- `npm eject` - Eject from Create React App

## Features Overview

### Authentication
- Secure login/registration
- JWT token management
- Protected routes
- Auto-logout on token expiry

### Chat Features
- Real-time messaging
- Typing indicators
- Message status (sent, delivered, read)
- File sharing support
- Message reactions
- Reply to messages

### Call Features
- Video calls with WebRTC
- Voice calls
- Screen sharing (planned)
- Call controls (mute, video toggle)

### UI/UX
- WhatsApp-like design
- Responsive layout
- Dark/light theme support
- Smooth animations
- Mobile-optimized

## API Integration

The frontend communicates with the backend through REST APIs and WebSocket connections:

- **REST API** - For CRUD operations
- **Socket.IO** - For real-time features
- **WebRTC** - For video/voice calls

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.
