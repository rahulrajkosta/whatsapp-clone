import React from 'react';
import { useCall } from '../../contexts/CallContext';
import CallNotification from './CallNotification';
import IncomingCall from './IncomingCall';

const CallOverlay = () => {
  const { 
    incomingCall, 
    outgoingCall, 
    activeCall, 
    callStatus,
    acceptCall, 
    rejectCall, 
    cancelCall 
  } = useCall();

  // Show incoming call notification
  if (incomingCall && callStatus === 'ringing') {
    return (
      <IncomingCall
        caller={incomingCall.caller}
        callType={incomingCall.callType}
        onAccept={acceptCall}
        onReject={rejectCall}
        onCancel={rejectCall}
      />
    );
  }

  // Show outgoing call status
  if (outgoingCall && callStatus === 'calling') {
    return (
      <div className="fixed top-4 right-4 bg-white rounded-lg shadow-lg p-4 max-w-sm z-50 border-l-4 border-blue-500">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
            <span className="text-white font-semibold">
              {(outgoingCall.participantId && outgoingCall.participantId.charAt(0)) || '👤'}
            </span>
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-800">Calling...</h3>
            <p className="text-sm text-gray-600">
              {outgoingCall.callType === 'video' ? 'Video call' : 'Voice call'}
            </p>
          </div>
          <button
            onClick={cancelCall}
            className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors"
            title="Cancel Call"
          >
            ✕
          </button>
        </div>
      </div>
    );
  }

  return null;
};

export default CallOverlay;
