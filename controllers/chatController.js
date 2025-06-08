const Message = require('../models/Message');
const User = require('../models/User');
const Chat = require('../models/Chat');

// @desc    Get chat details
// @route   GET /api/chats/:chatId
// @access  Private
exports.getChat = async (req, res) => {
    try {
        const chatId = req.params.chatId;
        const chat = await Chat.findById(chatId)
            .populate('participants', 'username avatar status')
            .populate({
                path: 'messages',
                populate: {
                    path: 'sender',
                    select: 'username avatar'
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

        res.json(chat);
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
        const { content, file } = req.body;
        
        const chat = await Chat.findById(chatId);
        if (!chat) {
            return res.status(404).json({ message: 'Chat not found' });
        }

        const message = new Message({
            chatId,
            sender: req.user.id,
            content,
            file: file || null
        });

        await message.save();
        chat.messages.push(message._id);
        await chat.save();

        // Populate sender info for response
        await message.populate('sender', 'username avatar');

        // Emit to all participants
        dd(req.app.get('io').to(chatId).emit('new_message', message));

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
        message.reactions = message.reactions.filter(
            r => r.userId.toString() !== req.user.id.toString()
        );

        // Add new reaction
        message.reactions.push({
            userId: req.user.id,
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
        message.edited = true;
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

        message.deleted = true;
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
    try {
        const { participants } = req.body;
        
        // Add current user to participants
        const allParticipants = [...new Set([...participants, req.user.id])];
        
        const chat = new Chat({
            participants: allParticipants,
            messages: []
        });

        await chat.save();
        
        // Populate participants info
        await chat.populate('participants', 'username avatar status');

        res.status(201).json(chat);
    } catch (error) {
        console.error('Create chat error:', error);
        res.status(500).json({ message: 'Error creating chat' });
    }
};