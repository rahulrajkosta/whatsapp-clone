const express = require('express');
const router = express.Router();
const callController = require('../controllers/callController');
const auth = require('../middleware/auth'); // Assuming you have authentication middleware

// All routes are protected with authentication
router.use(auth);

// Initiate a new call
router.post('/initiate', callController.initiateCall);

// Accept a call
router.post('/:callId/accept', callController.acceptCall);

// End a call
router.post('/:callId/end', callController.endCall);

// Get call history
router.get('/history', callController.getCallHistory);

module.exports = router; 