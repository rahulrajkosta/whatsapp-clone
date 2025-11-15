import React, { createContext, useContext, useState, useEffect } from 'react';
import { useSocket } from './SocketContext';
import { useAuth } from './AuthContext';

const CallContext = createContext();

export const useCall = () => {
  const context = useContext(CallContext);
  if (!context) {
    throw new Error('useCall must be used within a CallProvider');
  }
  return context;
};

export const CallProvider = ({ children }) => {
  const [incomingCall, setIncomingCall] = useState(null);
  const [outgoingCall, setOutgoingCall] = useState(null);
  const [activeCall, setActiveCall] = useState(null);
  const [callStatus, setCallStatus] = useState('idle'); // idle, calling, ringing, connected, ended
  
  const { socket } = useSocket();
  const { user } = useAuth();

  useEffect(() => {
    if (socket) {
      // Listen for incoming calls
      socket.on('incoming_call', handleIncomingCall);
      socket.on('call_accepted', handleCallAccepted);
      socket.on('call_rejected', handleCallRejected);
      socket.on('call_ended', handleCallEnded);
      socket.on('call_cancelled', handleCallCancelled);
      
      return () => {
        socket.off('incoming_call');
        socket.off('call_accepted');
        socket.off('call_rejected');
        socket.off('call_ended');
        socket.off('call_cancelled');
      };
    }
  }, [socket]);

  const handleIncomingCall = (data) => {
    console.log('Incoming call:', data);
    setIncomingCall({
      id: data.callId,
      caller: data.caller,
      callType: data.callType,
      timestamp: Date.now()
    });
    setCallStatus('ringing');
  };

  const handleCallAccepted = (data) => {
    console.log('Call accepted:', data);
    setOutgoingCall(null);
    setActiveCall({
      id: data.callId,
      participant: data.participant,
      callType: data.callType
    });
    setCallStatus('connected');
  };

  const handleCallRejected = (data) => {
    console.log('Call rejected:', data);
    setOutgoingCall(null);
    setCallStatus('idle');
  };

  const handleCallEnded = (data) => {
    console.log('Call ended:', data);
    setIncomingCall(null);
    setOutgoingCall(null);
    setActiveCall(null);
    setCallStatus('idle');
  };

  const handleCallCancelled = (data) => {
    console.log('Call cancelled:', data);
    setIncomingCall(null);
    setOutgoingCall(null);
    setCallStatus('idle');
  };

  const initiateCall = (participantId, callType) => {
    const callId = `call_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    console.log('Initiating call:', { callId, participantId, callType, userId: user.id });
    
    setOutgoingCall({
      id: callId,
      participantId,
      callType,
      timestamp: Date.now()
    });
    setCallStatus('calling');

    // Send call initiation to the participant
    socket.emit('initiate_call', {
      callId,
      participantId,
      callType
    });

    // Auto-reject after 30 seconds if no response
    setTimeout(() => {
      if (callStatus === 'calling') {
        console.log('Call timeout, cancelling...');
        cancelCall();
      }
    }, 30000);
  };

  const acceptCall = () => {
    if (incomingCall) {
      console.log('Accepting call:', incomingCall);
      
      socket.emit('accept_call', {
        callId: incomingCall.id,
        participantId: incomingCall.caller.id
      });
      
      setActiveCall({
        id: incomingCall.id,
        participant: incomingCall.caller,
        callType: incomingCall.callType
      });
      setIncomingCall(null);
      setCallStatus('connected');
    }
  };

  const rejectCall = () => {
    if (incomingCall) {
      socket.emit('reject_call', {
        callId: incomingCall.id,
        participantId: incomingCall.caller.id
      });
      setIncomingCall(null);
      setCallStatus('idle');
    }
  };

  const cancelCall = () => {
    if (outgoingCall) {
      socket.emit('cancel_call', {
        callId: outgoingCall.id,
        participantId: outgoingCall.participantId
      });
      setOutgoingCall(null);
      setCallStatus('idle');
    }
  };

  const endCall = () => {
    if (activeCall) {
      socket.emit('end_call', {
        callId: activeCall.id,
        participantId: activeCall.participant.id
      });
      setActiveCall(null);
      setCallStatus('idle');
    }
  };

  const value = {
    incomingCall,
    outgoingCall,
    activeCall,
    callStatus,
    initiateCall,
    acceptCall,
    rejectCall,
    cancelCall,
    endCall
  };

  return (
    <CallContext.Provider value={value}>
      {children}
    </CallContext.Provider>
  );
};
