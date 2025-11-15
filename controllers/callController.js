const Call = require('../models/Call');
const CallLog = require('../models/CallLog');
const { v4: uuidv4 } = require('uuid');

// Initialize call
exports.initiateCall = async (req, res) => {
    try {
        const { receiverId, type } = req.body;
        const callerId = req.user._id; // Assuming you have user authentication middleware

        const roomId = uuidv4();
        
        const call = new Call({
            caller: callerId,
            receiver: receiverId,
            type,
            roomId
        });
        // Create call log entry (status pending)
        await CallLog.create({
            chatId: req.body.chatId || null,
            caller: callerId,
            callee: receiverId,
            callType: type === 'video' ? 'video' : 'voice',
            status: 'missed',
            startedAt: new Date()
        });

        await call.save();

        // Emit socket event to notify receiver
        req.app.get('io').to(receiverId).emit('incomingCall', {
            callId: call._id,
            callerId,
            type,
            roomId
        });

        res.status(201).json({
            success: true,
            data: call
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

// Accept call
exports.acceptCall = async (req, res) => {
    try {
        const { callId } = req.params;
        const call = await Call.findById(callId);

        if (!call) {
            return res.status(404).json({
                success: false,
                error: 'Call not found'
            });
        }

        call.status = 'accepted';
        await call.save();

        // Update call log to accepted
        await CallLog.findOneAndUpdate(
            { caller: call.caller, callee: call.receiver },
            { status: 'accepted' },
            { sort: { startedAt: -1 } }
        );

        // Notify caller that call was accepted
        req.app.get('io').to(call.caller.toString()).emit('callAccepted', {
            callId: call._id,
            roomId: call.roomId
        });

        res.status(200).json({
            success: true,
            data: call
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

// End call
exports.endCall = async (req, res) => {
    try {
        const { callId } = req.params;
        const call = await Call.findById(callId);

        if (!call) {
            return res.status(404).json({
                success: false,
                error: 'Call not found'
            });
        }

        call.status = 'ended';
        call.endTime = new Date();
        await call.save();

        // Update call log end time and duration
        const log = await CallLog.findOne({ caller: call.caller, callee: call.receiver }).sort({ startedAt: -1 });
        if (log) {
            log.endedAt = new Date();
            log.status = log.status === 'accepted' ? 'accepted' : log.status; // keep accepted if already
            log.duration = Math.max(0, Math.floor((log.endedAt - log.startedAt) / 1000));
            await log.save();
        }

        // Notify both parties that call has ended
        req.app.get('io').to(call.caller.toString()).emit('callEnded', { callId: call._id });
        req.app.get('io').to(call.receiver.toString()).emit('callEnded', { callId: call._id });

        res.status(200).json({
            success: true,
            data: call
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

// Get call history
exports.getCallHistory = async (req, res) => {
    try {
        const userId = req.user._id;
        const calls = await Call.find({
            $or: [
                { caller: userId },
                { receiver: userId }
            ]
        })
        .sort({ createdAt: -1 })
        .populate('caller receiver', 'name avatar');

        res.status(200).json({
            success: true,
            data: calls
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
}; 