const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const chatController = require('../../api/chatController');

// @route   GET api/chats/:chatId
// @desc    Get chat details
// @access  Private
router.get('/:chatId', auth, chatController.getChat);

// @route   POST api/chats
// @desc    Create new chat
// @access  Private
router.post('/', auth, chatController.createChat);

router.get('/', auth, chatController.chatList);

// @route   POST api/chats/:chatId/messages
// @desc    Send message
// @access  Private
router.post('/:chatId/messages', auth, chatController.sendMessage);

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