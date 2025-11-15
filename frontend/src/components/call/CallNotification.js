import React, { useState, useEffect } from 'react';
import { FaPhone, FaVideo, FaPhoneSlash } from 'react-icons/fa';

const CallNotification = ({ 
  caller, 
  callType, 
  callId,
  onAccept, 
  onReject 
}) => {
  const [timeLeft, setTimeLeft] = useState(30); // 30 seconds to answer

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          onReject(); // Auto reject after timeout
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [onReject]);

  return (
    <div className="fixed top-4 right-4 bg-white rounded-lg shadow-lg p-4 max-w-sm z-50 border-l-4 border-whatsapp-green">
      <div className="flex items-center space-x-3">
        {/* Caller Avatar */}
        <div className="w-12 h-12 bg-whatsapp-green rounded-full flex items-center justify-center">
          <span className="text-white font-semibold">
            {caller?.name?.charAt(0) || '👤'}
          </span>
        </div>

        {/* Call Info */}
        <div className="flex-1">
          <h3 className="font-semibold text-gray-800">
            {caller?.name || 'Unknown User'}
          </h3>
          <p className="text-sm text-gray-600">
            {callType === 'video' ? 'Video call' : 'Voice call'}
          </p>
          <p className="text-xs text-gray-500">
            Time left: {timeLeft}s
          </p>
        </div>

        {/* Call Controls */}
        <div className="flex space-x-2">
          <button
            onClick={onAccept}
            className="p-2 bg-green-500 hover:bg-green-600 text-white rounded-full transition-colors"
            title="Accept"
          >
            {callType === 'video' ? (
              <FaVideo className="text-lg" />
            ) : (
              <FaPhone className="text-lg" />
            )}
          </button>
          
          <button
            onClick={onReject}
            className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors"
            title="Reject"
          >
            <FaPhoneSlash className="text-lg" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CallNotification;
