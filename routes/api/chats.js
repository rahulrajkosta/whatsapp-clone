const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const chatController = require('../../api/chatController');
const upload = require('../../middleware/upload');

// @route   GET api/chats/:chatId
// @desc    Get chat details
// @access  Private
router.get('/:chatId', auth, chatController.getChat);

// @route   GET api/chats/:chatId/messages
// @desc    Get chat messages
// @access  Private
router.get('/:chatId/messages', auth, chatController.getMessages);

// @route   POST api/chats
// @desc    Create new chat
// @access  Private
router.post('/', auth, chatController.createChat);

router.get('/', auth, chatController.chatList);

// @route   POST api/chats/:chatId/messages
// @desc    Send message
// @access  Private
router.post('/:chatId/messages', auth, chatController.sendMessage);

// @route   POST api/chats/:chatId/attachments
// @desc    Upload attachment for a chat message
// @access  Private
router.post('/:chatId/attachments', auth, upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }
        const fileUrl = `/uploads/${req.file.filename}`;
        res.json({
            url: fileUrl,
            fileName: req.file.originalname,
            fileSize: req.file.size,
            mimeType: req.file.mimetype
        });
    } catch (error) {
        console.error('Attachment upload error:', error);
        res.status(500).json({ message: 'Error uploading attachment' });
    }
});

// @route   PUT api/chats/messages/:messageId/read
// @desc    Mark message as read
// @access  Private
router.put('/messages/:messageId/read', auth, chatController.markAsRead);

// @route   POST api/chats/messages/:messageId/reactions
// @desc    Add reaction to message
// @access  Private
router.post('/messages/:messageId/reactions', auth, chatController.addReaction);

// @route   PUT api/chats/messages/:messageId
// @desc    Edit message
// @access  Private
router.put('/messages/:messageId', auth, chatController.editMessage);

// @route   DELETE api/chats/messages/:messageId
// @desc    Delete message
// @access  Private
router.delete('/messages/:messageId', auth, chatController.deleteMessage);

// @route   GET api/chats/unread
// @desc    Get unread message count
// @access  Private
router.get('/unread', auth, chatController.getUnreadCount);

module.exports = router;