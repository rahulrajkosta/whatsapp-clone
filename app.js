const express = require('express');
const app = express();
const path = require('path');
const connectDB = require('./config/db');
const User = require('./models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');
const contactController = require("./controllers/contactController");
const http = require("http");
const { Server } = require("socket.io");
const auth = require('./middleware/auth');
const chatRoute = require("./routes/api/chats");

const server = http.createServer(app);
const io = new Server(server);

// Connect Database
connectDB();

// Init Middleware
app.use(express.json({ extended: false }));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));

app.get('/login', (req, res) => {
    res.render('login');
});

app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        let user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({ msg: 'Invalid Credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({ msg: 'Invalid Credentials' });
        }

        const payload = {
            user: {
                id: user.id
            }
        };

        jwt.sign(
            payload,
            config.get('jwtSecret'),
            { expiresIn: '1h' },
            (err, token) => {
                if (err) throw err;
                res.json({ msg: 'Login successful', _id: user._id, token });
            }
        );

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

app.get('/signup', (req, res) => {
    res.render('signup');
});

app.post('/signup', async (req, res) => {
    const { name, email, password } = req.body;

    try {
        let user = await User.findOne({ email });

        if (user) {
            return res.status(400).json({ msg: 'User already exists' });
        }

        user = new User({
            name,
            email,
            password
        });

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);

        await user.save();

        const payload = {
            user: {
                id: user.id
            }
        };

        jwt.sign(
            payload,
            config.get('jwtSecret'),
            { expiresIn: '1h' },
            (err, token) => {
                if (err) throw err;
                res.status(200).json({ msg: 'User registered successfully', token });
            }
        );

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

app.get('/chat-list', (req, res) => {
    res.render('chat-list');
});

app.get('/chat-window', (req, res) => {
    res.render('chat-window');
});

app.get('/profile', (req, res) => {
    res.render('profile');
});

app.get('/call-screen', (req, res) => {
    res.render('call-screen');
});

app.get('/chat-info', (req, res) => {
    res.render('chat-info');
});

app.get('/notifications', (req, res) => {
    res.render('notifications');
});

app.get('/group-chat', (req, res) => {
    res.render('group-chat');
});

app.get('/audit-log', (req, res) => {
    res.render('audit-log');
});

app.get('/settings', (req, res) => {
    res.render('settings');
});

app.get('/new-chat', (req, res) => {
    res.render('new-chat');
});

app.get('/new-contact', (req, res) => {
    res.render('new-contact');
});

// Contact Routes
app.get('/api/contacts', auth, contactController.getContacts);
app.post('/api/contacts', [auth, contactController.validateContact], contactController.addContact);
app.put('/api/contacts/:id', [auth, contactController.validateContact], contactController.updateContact);
app.delete('/api/contacts/:id', auth, contactController.deleteContact);
app.get('/api/contacts/suggested', auth, contactController.getSuggestedContacts);

// Chat Ruutes
app.use("/api/chats", chatRoute);
    
// Socket.IO connection with authentication
io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    
    if (!token) {
        return next(new Error('Authentication error'));
    }

    try {
        const decoded = jwt.verify(token, config.get('jwtSecret'));
        socket.userId = decoded.user.id;
        next();
    } catch (error) {
        next(new Error('Invalid token'));
    }
});

// Socket.io connection handler
io.on('connection', (socket) => {
    console.log('New client connected');

    // Set user as online when they connect
    if (socket.userId) {
        User.findByIdAndUpdate(socket.userId, {
            isOnline: true,
            lastSeen: new Date()
        }).then(() => {
            // Broadcast user's online status to all clients
            io.emit('user_status_changed', {
                userId: socket.userId,
                isOnline: true,
                lastSeen: new Date()
            });
        });
    }

    // Handle joining chat
    socket.on('join_chat', async ({ chatId, userId }) => {
        try {
            // Join the chat room
            socket.join(chatId);
            console.log(`User ${userId} joined chat ${chatId}`);

            // Emit user joined event
            socket.to(chatId).emit('user_joined', {
                userId,
                timestamp: new Date()
            });
        } catch (error) {
            console.error('Error joining chat:', error);
        }
    });

    // Handle leaving chat
    socket.on('leave_chat', ({ chatId, userId }) => {
        socket.leave(chatId);
        console.log(`User ${userId} left chat ${chatId}`);

        // Emit user left event
        socket.to(chatId).emit('user_left', {
            userId,
            timestamp: new Date()
        });
    });

    // Handle typing status
    socket.on('typing', ({ chatId, userId, isTyping }) => {
        socket.to(chatId).emit('user_typing', {
            userId,
            isTyping,
            timestamp: new Date()
        });
    });

    // Handle disconnection
    socket.on('disconnect', async () => {
        console.log('Client disconnected');
        
        // Set user as offline when they disconnect
        if (socket.userId) {
            try {
                await User.findByIdAndUpdate(socket.userId, {
                    isOnline: false,
                    lastSeen: new Date()
                });

                // Broadcast user's offline status to all clients
                io.emit('user_status_changed', {
                    userId: socket.userId,
                    isOnline: false,
                    lastSeen: new Date()
                });
            } catch (error) {
                console.error('Error updating user status:', error);
            }
        }
    });
});

// app.get('/*', (req, res) => {
//     res.status(404).render('404');
// });

// Store socket.io instance in app
app.set('io', io);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
}); 