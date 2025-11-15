const express = require('express');
const cors = require("cors");
const app = express();
const path = require('path');
const connectDB = require('./config/db');
const User = require('./models/User');
const jwt = require('jsonwebtoken');
const config = require('config');
const http = require("http");
const { Server } = require("socket.io");
const { ExpressPeerServer } = require('peer');
const chatRoute = require("./routes/api/chats");
const callRoutes = require('./routes/callRoutes');
const Chat = require('./models/Chat');
const Message = require('./models/Message');

// Connect Database
connectDB();

const server = http.createServer(app);

// Allowed origins
const allowedOrigins = ['https://frontend-tau-six-22.vercel.app', 'https://whatsapp-9pcdoxvrh-rahul-raj-kostas-projects.vercel.app'],

// CORS configuration
const corsOptions = {
    origin: function (origin, callback) {
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(null, true); // Allow all for now, tighten in production
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type','Authorization','x-auth-token','X-Requested-With'],
    exposedHeaders: ['Authorization', 'x-auth-token'],
    credentials: true
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// Socket.IO with CORS
const io = new Server(server, {
    cors: {
        origin: allowedOrigins,
        methods: ["GET", "POST"],
        credentials: true
    }
});

// Create PeerJS server
const peerServer = ExpressPeerServer(server, {
    debug: true,
    path: '/peerjs'
});

app.use('/peerjs', peerServer);
app.use('/uploads', express.static(path.join(__dirname, 'public', 'uploads')));

// Init Middleware
app.use(express.json({ extended: false }));

// Health check
app.get('/', (req, res) => {
    res.json({ 
        status: 'ok', 
        message: 'Backend API is running',
        timestamp: new Date().toISOString() 
    });
});

app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', require('./routes/api/auth'));
app.use('/api/users', require('./routes/api/users'));
app.use('/api/contacts', require('./routes/api/contacts'));
app.use('/api/chats', chatRoute);
app.use('/api/calls', callRoutes);

// Socket.IO connection with authentication
io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    
    if (!token) {
        return next(new Error('Authentication error'));
    }

    try {
        const decoded = jwt.verify(token, config.get('jwtSecret'));
        socket.userId = decoded.user.id;
        socket.userName = decoded.user.name;
        socket.userEmail = decoded.user.email;
        next();
    } catch (error) {
        next(new Error('Invalid token'));
    }
});

// Socket.io connection handler
io.on('connection', (socket) => {
    console.log('New client connected:', socket.userId);

    socket.join(socket.userId);

    if (socket.userId) {
        User.findByIdAndUpdate(socket.userId, {
            isOnline: true,
            lastSeen: new Date()
        }).then(async () => {
            socket.broadcast.emit('user_status_changed', {
                userId: socket.userId,
                isOnline: true,
                lastSeen: new Date()
            });

            const chats = await Chat.find({ participants: socket.userId });
            
            for (const chat of chats) {
                const unreadMessages = await Message.find({
                    chatId: chat._id,
                    sender: { $ne: socket.userId },
                    readBy: { $ne: socket.userId }
                });

                if (unreadMessages.length > 0) {
                    socket.emit('message_delivered', {
                        chatId: chat._id,
                        count: unreadMessages.length
                    });
                }
            }
        }).catch(err => console.error('Error updating user status:', err));
    }

    socket.on('send_message', async (data) => {
        try {
            const { chatId, message } = data;
            const chat = await Chat.findById(chatId).populate('participants', 'id');
            
            if (chat) {
                chat.participants.forEach(participant => {
                    if (participant.id !== socket.userId) {
                        socket.to(participant.id).emit('new_message', message);
                    }
                });
            }
        } catch (error) {
            console.error('Error handling send_message:', error);
        }
    });

    socket.on('typing', (data) => {
        socket.to(data.chatId).emit('typing', {
            chatId: data.chatId,
            userId: socket.userId
        });
    });

    socket.on('stop_typing', (data) => {
        socket.to(data.chatId).emit('stop_typing', {
            chatId: data.chatId,
            userId: socket.userId
        });
    });

    socket.on('join-call-room', (roomId) => {
        socket.join(roomId);
    });

    socket.on('leave-call-room', (roomId) => {
        socket.leave(roomId);
    });

    socket.on('call-signal', (data) => {
        socket.to(data.roomId).emit('call-signal', {
            signal: data.signal,
            from: socket.userId
        });
    });

    socket.on('share-peer-id', (data) => {
        socket.to(data.callId).emit('peer-id-shared', {
            callId: data.callId,
            peerId: data.peerId,
            userId: socket.userId
        });
    });

    socket.on('initiate_call', (data) => {
        console.log('Call initiated:', data);
        socket.to(data.participantId).emit('incoming_call', {
            callId: data.callId,
            caller: {
                id: socket.userId,
                name: socket.userName || 'Unknown User',
                email: socket.userEmail || ''
            },
            callType: data.callType
        });
    });

    socket.on('accept_call', (data) => {
        console.log('Call accepted:', data);
        socket.to(data.participantId).emit('call_accepted', {
            callId: data.callId,
            participant: {
                id: socket.userId,
                name: socket.userName || 'User',
                email: socket.userEmail || ''
            },
            callType: data.callType
        });
    });

    socket.on('reject_call', (data) => {
        console.log('Call rejected:', data);
        socket.to(data.participantId).emit('call_rejected', {
            callId: data.callId
        });
    });

    socket.on('cancel_call', (data) => {
        console.log('Call cancelled:', data);
        socket.to(data.participantId).emit('call_cancelled', {
            callId: data.callId
        });
    });

    socket.on('end_call', (data) => {
        console.log('Call ended:', data);
        socket.to(data.participantId).emit('call_ended', {
            callId: data.callId
        });
    });

    socket.on('disconnect', () => {
        if (socket.userId) {
            User.findByIdAndUpdate(socket.userId, {
                isOnline: false,
                lastSeen: new Date()
            }).then(() => {
                socket.broadcast.emit('user_status_changed', {
                    userId: socket.userId,
                    isOnline: false,
                    lastSeen: new Date()
                });
            }).catch(err => console.error('Error updating user status on disconnect:', err));
        }
        console.log('Client disconnected:', socket.userId);
    });
});

app.set('io', io);

// For local development
if (process.env.NODE_ENV !== 'production') {
    const PORT = process.env.PORT || 5000;
    server.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}

// Export for Vercel
module.exports = app;