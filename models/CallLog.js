const mongoose = require('mongoose');

const CallLogSchema = new mongoose.Schema({
    chatId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Chat'
    },
    caller: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    callee: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    callType: {
        type: String,
        enum: ['voice', 'video'],
        required: true
    },
    status: {
        type: String,
        enum: ['missed', 'accepted', 'rejected'],
        required: true
    },
    duration: {
        type: Number // in seconds
    },
    startedAt: {
        type: Date,
        default: Date.now
    },
    endedAt: {
        type: Date
    }
});

module.exports = mongoose.model('CallLog', CallLogSchema); 