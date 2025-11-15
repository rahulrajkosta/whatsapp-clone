import React, { useEffect, useRef } from 'react';
import { FaPhone, FaVideo, FaPhoneSlash } from 'react-icons/fa';

const IncomingCall = ({ 
  caller, 
  callType, 
  onAccept, 
  onReject, 
  onCancel 
}) => {
  const audioRef = useRef(null);

  useEffect(() => {
    // Create and play ringtone
    const playRingtone = () => {
      try {
        // Create a simple ringtone using Web Audio API
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        
        const createTone = (frequency, duration, startTime) => {
          const oscillator = audioContext.createOscillator();
          const gainNode = audioContext.createGain();
          
          oscillator.connect(gainNode);
          gainNode.connect(audioContext.destination);
          
          oscillator.frequency.setValueAtTime(frequency, startTime);
          oscillator.type = 'sine';
          
          gainNode.gain.setValueAtTime(0, startTime);
          gainNode.gain.linearRampToValueAtTime(0.3, startTime + 0.01);
          gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
          
          oscillator.start(startTime);
          oscillator.stop(startTime + duration);
          
          return oscillator;
        };

        // Create a ringtone pattern (like a phone ring)
        const ringPattern = () => {
          const now = audioContext.currentTime;
          
          // First ring
          createTone(800, 0.4, now);
          createTone(1000, 0.4, now);
          
          // Second ring
          createTone(800, 0.4, now + 0.5);
          createTone(1000, 0.4, now + 0.5);
          
          // Third ring
          createTone(800, 0.4, now + 1.0);
          createTone(1000, 0.4, now + 1.0);
          
          // Pause
          setTimeout(() => {
            if (audioRef.current) {
              ringPattern();
            }
          }, 2000);
        };

        ringPattern();
        
      } catch (error) {
        console.log('Could not play ringtone:', error);
        // Fallback: try to play a simple beep
        try {
          const audio = new Audio();
          audio.src = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT';
          audio.loop = true;
          audio.volume = 0.3;
          audio.play();
          audioRef.current = audio;
        } catch (fallbackError) {
          console.log('Fallback audio also failed:', fallbackError);
        }
      }
    };

    playRingtone();

    // Cleanup function
    return () => {
      if (audioRef.current) {
        if (audioRef.current.stop) {
          audioRef.current.stop();
        } else if (audioRef.current.pause) {
          audioRef.current.pause();
        }
        audioRef.current = null;
      }
    };
  }, []);
  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
        {/* Caller Info */}
        <div className="text-center mb-6">
          <div className="w-20 h-20 bg-whatsapp-green rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl text-white">
              {(caller && caller.name && caller.name.charAt(0)) || '👤'}
            </span>
          </div>
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">
            {(caller && caller.name) || 'Unknown User'}
          </h2>
          <p className="text-gray-600">
            {callType === 'video' ? 'Incoming video call' : 'Incoming voice call'}
          </p>
        </div>

        {/* Call Controls */}
        <div className="flex justify-center space-x-6">
          {/* Accept Call */}
          <button
            onClick={onAccept}
            className="p-4 bg-green-500 hover:bg-green-600 text-white rounded-full transition-colors"
            title="Accept Call"
          >
            {callType === 'video' ? (
              <FaVideo className="text-2xl" />
            ) : (
              <FaPhone className="text-2xl" />
            )}
          </button>

          {/* Reject Call */}
          <button
            onClick={onReject}
            className="p-4 bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors"
            title="Reject Call"
          >
            <FaPhoneSlash className="text-2xl" />
          </button>
        </div>

        {/* Call Status */}
        <div className="text-center mt-4">
          <p className="text-sm text-gray-500">
            Ringing...
          </p>
        </div>
      </div>
    </div>
  );
};

export default IncomingCall;
