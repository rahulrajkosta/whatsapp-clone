const Message = require('../models/Message');
const User = require('../models/User');
const Chat = require('../models/Chat');

// @desc    Get chat details
// @route   GET /api/chats/:chatId
// @access  Private
exports.getChat = async (req, res) => {
    try {
        const chatId = req.params.chatId;
        
        if (!chatId) {
            return res.status(400).json({ message: 'Chat ID is required' });
        }

        const chat = await Chat.findById(chatId)
            .populate({
                path: 'participants',
                select: 'name avatar status email phone lastSeen isOnline bio',
                populate: {
                    path: 'status',
                    select: 'text emoji'
                }
            });

        if (!chat) {
            return res.status(404).json({ message: 'Chat not found' });
        }

        // Check if user is a participant
        const isParticipant = chat.participants.some(
            p => p._id.toString() === req.user.id.toString()
        );

        if (!isParticipant) {
            return res.status(403).json({ message: 'You are not authorized to view this chat' });
        }

        // Get messages separately
        const messages = await Message.find({ chatId })
            .populate('sender', 'name avatar status')
            .sort({ createdAt: 1 });

        // Format participant data
        const formattedParticipants = chat.participants.map(participant => ({
            _id: participant._id,
            username: participant.name,
            avatar: participant.avatar,
            status: participant.status,
            email: participant.email,
            phone: participant.phone,
            lastSeen: participant.lastSeen,
            isOnline: participant.isOnline,
            bio: participant.bio
        }));

        // Combine chat and messages with formatted participants
        const chatWithMessages = {
            ...chat.toObject(),
            participants: formattedParticipants,
            messages,
            metadata: {
                totalParticipants: formattedParticipants.length,
                lastActivity: messages.length > 0 ? messages[messages.length - 1].createdAt : chat.createdAt,
                isGroupChat: formattedParticipants.length > 2
            }
        };

        // Emit chat details through socket
        const io = req.app.get('io');
        io.to(chatId).emit('chat_details', chatWithMessages);

        res.json(chatWithMessages);
    } catch (error) {
        console.error('Get chat error:', error);
        res.status(500).json({ message: 'Error loading chat' });
    }
};

// @desc    Send message
// @route   POST /api/chats/:chatId/messages
// @access  Private
exports.sendMessage = async (req, res) => {
    try {
        const { chatId } = req.params;
        const { content, type, mediaMeta, file } = req.body;
        
        if (!content && !file) {
            return res.status(400).json({ message: 'Message content or file is required' });
        }

        // Find chat and ensure it exists
        const chat = await Chat.findById(chatId);
        if (!chat) {
            return res.status(404).json({ message: 'Chat not found' });
        }

        // Check if user is a participant
        const isParticipant = chat.participants.some(
            p => p.toString() === req.user.id.toString()
        );

        if (!isParticipant) {
            return res.status(403).json({ message: 'You are not authorized to send messages in this chat' });
        }

        // Get other participants with full user data
        const otherParticipants = await User.find({
            _id: { 
                $in: chat.participants.filter(p => p.toString() !== req.user.id.toString())
            }
        }).select('-password');

        otherParticipants.forEach(user => {
            
        })
        // Create new message (support legacy `file` and new `type`/`mediaMeta`)
        const messagePayload = {
            chatId,
            sender: req.user.id,
            content: content || '',
            readBy: [req.user.id]
        };

        if (type) {
            messagePayload.type = type;
        }

        if (mediaMeta) {
            messagePayload.mediaMeta = mediaMeta;
        }

        // legacy compatibility: if `file` provided, coerce into attachment
        if (file && typeof file === 'object') {
            messagePayload.type = file.type || 'file';
            messagePayload.mediaMeta = {
                url: file.url,
                fileName: file.fileName,
                fileSize: file.fileSize,
                mimeType: file.mimeType
            };
        }

        const message = new Message(messagePayload);

        // Save message
        await message.save();

        // Update chat with new message
        await Chat.findByIdAndUpdate(
            chatId,
            { 
                $push: { messages: message._id },
                lastMessage: message._id,
                updatedAt: new Date()
            },
            { new: true }
        );

        // Populate sender info for response
        await message.populate('sender', 'name avatar status');

        // Emit to all participants
        const io = req.app.get('io');
        io.to(chatId).emit('new_message', message);

        console.log(message.content);
        res.status(201).json(message);
    } catch (error) {
        console.error('Send message error:', error);
        res.status(500).json({ message: 'Error sending message' });
    }
};

// @desc    Mark message as read
// @route   PUT /api/chats/messages/:messageId/read
// @access  Private
exports.markAsRead = async (req, res) => {
    try {
        const { messageId } = req.params;
        const message = await Message.findById(messageId);

        if (!message) {
            return res.status(404).json({ message: 'Message not found' });
        }

        // Check if already read by this user
        if (!message.readBy.includes(req.user.id)) {
            message.readBy.push(req.user.id);
            message.status = 'read';
            await message.save();

            // Emit read status
            req.app.get('io').to(message.chatId.toString()).emit('message_read', {
                messageId,
                userId: req.user.id
            });
        }

        res.json({ message: 'Message marked as read' });
    } catch (error) {
        console.error('Mark as read error:', error);
        res.status(500).json({ message: 'Error marking message as read' });
    }
};

// @desc    Add reaction to message
// @route   POST /api/chats/messages/:messageId/reactions
// @access  Private
exports.addReaction = async (req, res) => {
    try {
        const { messageId } = req.params;
        const { emoji } = req.body;
        const message = await Message.findById(messageId);

        if (!message) {
            return res.status(404).json({ message: 'Message not found' });
        }

        // Remove existing reaction from this user
        message.reactions = (message.reactions || []).filter(
            r => (r.user || r.userId)?.toString() !== req.user.id.toString()
        );

        // Add new reaction (schema uses `user` field)
        message.reactions.push({
            user: req.user.id,
            emoji
        });

        await message.save();

        // Emit reaction
        req.app.get('io').to(message.chatId.toString()).emit('message_reaction', {
            messageId,
            reaction: {
                userId: req.user.id,
                emoji
            }
        });

        res.json(message);
    } catch (error) {
        console.error('Add reaction error:', error);
        res.status(500).json({ message: 'Error adding reaction' });
    }
};

// @desc    Edit message
// @route   PUT /api/chats/messages/:messageId
// @access  Private
exports.editMessage = async (req, res) => {
    try {
        const { messageId } = req.params;
        const { content } = req.body;
        const message = await Message.findById(messageId);

        if (!message) {
            return res.status(404).json({ message: 'Message not found' });
        }

        // Check if user is the sender
        if (message.sender.toString() !== req.user.id.toString()) {
            return res.status(403).json({ message: 'Not authorized to edit this message' });
        }

        message.content = content;
        message.isEdited = true;
        await message.save();

        // Emit edited message
        req.app.get('io').to(message.chatId.toString()).emit('message_edited', message);

        res.json(message);
    } catch (error) {
        console.error('Edit message error:', error);
        res.status(500).json({ message: 'Error editing message' });
    }
};

// @desc    Delete message
// @route   DELETE /api/chats/messages/:messageId
// @access  Private
exports.deleteMessage = async (req, res) => {
    try {
        const { messageId } = req.params;
        const message = await Message.findById(messageId);

        if (!message) {
            return res.status(404).json({ message: 'Message not found' });
        }

        // Check if user is the sender
        if (message.sender.toString() !== req.user.id.toString()) {
            return res.status(403).json({ message: 'Not authorized to delete this message' });
        }

        message.isDeleted = true;
        message.content = 'This message was deleted';
        await message.save();

        // Emit deleted message
        req.app.get('io').to(message.chatId.toString()).emit('message_deleted', {
            messageId,
            chatId: message.chatId
        });

        res.json({ message: 'Message deleted' });
    } catch (error) {
        console.error('Delete message error:', error);
        res.status(500).json({ message: 'Error deleting message' });
    }
};

// @desc    Get unread message count
// @route   GET /api/chats/unread
// @access  Private
exports.getUnreadCount = async (req, res) => {
    try {
        const chats = await Chat.find({
            participants: req.user.id
        });

        const unreadCounts = await Promise.all(
            chats.map(async chat => {
                const count = await Message.countDocuments({
                    chatId: chat._id,
                    sender: { $ne: req.user.id },
                    readBy: { $ne: req.user.id }
                });

                return {
                    chatId: chat._id,
                    count
                };
            })
        );

        res.json(unreadCounts);
    } catch (error) {
        console.error('Get unread count error:', error);
        res.status(500).json({ message: 'Error getting unread count' });
    }
};

// @desc    Create new chat
// @route   POST /api/chats
// @access  Private
exports.createChat = async (req, res) => {
    // try {
        const { participants } = req.body;
        
        if (! participants || !Array.isArray(participants) || participants.length === 0) {
            return res.status(400).json({ message: 'At least one participant is required' });
        }

        // Validate all participants exist
        const validParticipants = await User.find({
            _id: { $in: participants }
        });

        if (validParticipants.length !== participants.length) {
            return res.status(400).json({ message: 'One or more participants not found' });
        }
        
        // Add current user to participants
        const allParticipants = [...new Set([...participants, req.user.id])];
        
        // Check if chat already exists with these participants
        const existingChat = await Chat.findOne({
            participants: { $all: allParticipants },
            $expr: { $eq: [{ $size: "$participants" }, allParticipants.length] }
        });

        if (existingChat) {
            return res.status(200).json(existingChat);
        }

        const chat = new Chat({
            participants: allParticipants,
            messages: []
        });

        await chat.save();
        
        // Populate participants info
        await chat.populate('participants', 'username avatar status');

        res.status(201).json(chat);
    // } catch (error) {
    //     console.error('Create chat error:', error);
    //     res.status(500).json({ message: 'Error creating chat' });
    // }
};

// @desc    Join chat room
// @route   POST /api/chats/:chatId/join
// @access  Private
exports.joinChat = async (req, res) => {
    try {
        const { chatId } = req.params;
        const socketId = req.body.socketId;

        if (!socketId) {
            return res.status(400).json({ message: 'Socket ID is required' });
        }

        const chat = await Chat.findById(chatId);
        if (!chat) {
            return res.status(404).json({ message: 'Chat not found' });
        }

        // Check if user is a participant
        const isParticipant = chat.participants.some(
            p => p.toString() === req.user.id.toString()
        );

        if (!isParticipant) {
            return res.status(403).json({ message: 'You are not authorized to join this chat' });
        }

        // Join socket room
        const io = req.app.get('io');
        io.sockets.sockets.get(socketId)?.join(chatId);

        // Emit user joined event
        io.to(chatId).emit('user_joined', {
            userId: req.user.id,
            username: req.user.name,
            timestamp: new Date()
        });

        res.json({ message: 'Successfully joined chat' });
    } catch (error) {
        console.error('Join chat error:', error);
        res.status(500).json({ message: 'Error joining chat' });
    }
};

// @desc    Leave chat room
// @route   POST /api/chats/:chatId/leave
// @access  Private
exports.leaveChat = async (req, res) => {
    try {
        const { chatId } = req.params;
        const socketId = req.body.socketId;

        if (!socketId) {
            return res.status(400).json({ message: 'Socket ID is required' });
        }

        const chat = await Chat.findById(chatId);
        if (!chat) {
            return res.status(404).json({ message: 'Chat not found' });
        }

        // Leave socket room
        const io = req.app.get('io');
        io.sockets.sockets.get(socketId)?.leave(chatId);

        // Emit user left event
        io.to(chatId).emit('user_left', {
            userId: req.user.id,
            username: req.user.name,
            timestamp: new Date()
        });

        res.json({ message: 'Successfully left chat' });
    } catch (error) {
        console.error('Leave chat error:', error);
        res.status(500).json({ message: 'Error leaving chat' });
    }

};

exports.chatList = async (req, res) => {
    try {
        const chats = await Chat.find({
            participants: req.user.id
        }).populate({
            path: 'participants',
            select: 'name avatar status email phone lastSeen isOnline bio'
        }).populate({
            path: 'lastMessage',
            select: 'content createdAt sender readBy'
        });

        // Get unread counts for each chat
        const chatsWithUnreadCount = await Promise.all(chats.map(async (chat) => {
            const unreadCount = await Message.countDocuments({
                chatId: chat._id,
                sender: { $ne: req.user.id },
                readBy: { $ne: req.user.id }
            });

            const chatObj = chat.toObject();
            return {
                ...chatObj,
                unreadCount,
                lastMessage: chat.lastMessage ? {
                    content: chat.lastMessage.content,
                    createdAt: chat.lastMessage.createdAt,
                    sender: chat.lastMessage.sender,
                    isRead: chat.lastMessage.readBy.includes(req.user.id)
                } : null
            };
        }));

        res.json(chatsWithUnreadCount);
    } catch(error) {
        console.error('Chat list error:', error);
        res.status(500).json({ message: 'Error fetching chat list' });
    }
};

// @desc    Get chat messages
// @route   GET /api/chats/:chatId/messages
// @access  Private
exports.getMessages = async (req, res) => {
    try {
        const { chatId } = req.params;

        // Find chat and ensure it exists
        const chat = await Chat.findById(chatId);
        if (!chat) {
            return res.status(404).json({ message: 'Chat not found' });
        }

        // Check if user is a participant
        const isParticipant = chat.participants.some(
            p => p.toString() === req.user.id.toString()
        );

        if (!isParticipant) {
            return res.status(403).json({ message: 'You are not authorized to view messages in this chat' });
        }

        // Get messages with sender info
        const messages = await Message.find({ chatId })
            .populate('sender', 'name avatar status')
            .sort({ createdAt: 1 });

        // Mark messages as read
        const unreadMessages = messages.filter(
            message => !message.readBy.includes(req.user.id)
        );

        if (unreadMessages.length > 0) {
            await Message.updateMany(
                { _id: { $in: unreadMessages.map(m => m._id) } },
                { $addToSet: { readBy: req.user.id } }
            );

            // Emit read status for each message
            const io = req.app.get('io');
            unreadMessages.forEach(message => {
                io.to(chatId).emit('message_read', {
                    messageId: message._id,
                    userId: req.user.id
                });
            });
        }

        res.json(messages);
    } catch (error) {
        console.error('Get messages error:', error);
        res.status(500).json({ message: 'Error loading messages' });
    }
};