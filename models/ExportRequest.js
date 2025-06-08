const mongoose = require('mongoose');

const ExportRequestSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    chatId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Chat',
        required: true
    },
    format: {
        type: String,
        enum: ['pdf', 'csv', 'json'],
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'processing', 'ready', 'failed'],
        default: 'pending'
    },
    downloadUrl: {
        type: String
    },
    requestedAt: {
        type: Date,
        default: Date.now
    },
    completedAt: {
        type: Date
    }
});

module.exports = mongoose.model('ExportRequest', ExportRequestSchema); 