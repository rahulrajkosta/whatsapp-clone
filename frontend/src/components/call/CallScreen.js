import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useSocket } from '../../contexts/SocketContext';
import { useCall } from '../../contexts/CallContext';
import { FaPhone, FaVideo, FaMicrophone, FaMicrophoneSlash, FaVideoSlash, FaPhoneSlash } from 'react-icons/fa';
import Peer from 'peerjs';
import getNgrokConfig from '../../config/ngrok';

const CallScreen = () => {
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [callType, setCallType] = useState('video');
  const [peerId, setPeerId] = useState('');
  const [remotePeerId, setRemotePeerId] = useState('');
  const [isCallActive, setIsCallActive] = useState(false);
  
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerRef = useRef(null);
  const localStreamRef = useRef(null);
  const currentCallRef = useRef(null);
  
  const { user } = useAuth();
  const { socket } = useSocket();
  const { activeCall, endCall } = useCall();
  const { callId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  // If no active call, redirect to chats
  useEffect(() => {
    if (!activeCall) {
      console.log('No active call, redirecting to chats');
      navigate('/chats');
    }
  }, [activeCall, navigate]);

  // Get call type from active call or URL parameters
  useEffect(() => {
    if (activeCall) {
      setCallType(activeCall.callType);
    } else {
      const urlParams = new URLSearchParams(location.search);
      const type = urlParams.get('type');
      if (type === 'voice') {
        setCallType('voice');
      } else {
        setCallType('video');
      }
    }
  }, [activeCall, location.search]);

  useEffect(() => {
    initializeCall();
    
    return () => {
      endCall();
    };
  }, []);

  useEffect(() => {
    if (socket) {
      socket.on('call-ended', handleCallEnded);
      socket.on('peer-id-shared', handlePeerIdShared);
      
      return () => {
        socket.off('call-ended');
        socket.off('peer-id-shared');
      };
    }
  }, [socket]);

  const initializeCall = async () => {
    try {
      // Check if getUserMedia is supported with better detection
      if (!navigator.mediaDevices) {
        throw new Error('MediaDevices API is not supported in this browser. Please use Chrome, Firefox, Safari, or Edge.');
      }
      
      if (!navigator.mediaDevices.getUserMedia) {
        throw new Error('getUserMedia is not supported in this browser. Please use Chrome, Firefox, Safari, or Edge.');
      }
      
      // Check for HTTPS requirement (especially important for mobile)
      if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
        const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        if (isMobile) {
          throw new Error('Mobile browsers require HTTPS for camera access. Please use https:// instead of http:// or try http://localhost:3000');
        } else {
          throw new Error('Camera and microphone access requires HTTPS. Please use https:// instead of http://');
        }
      }

      // Show permission request message
      console.log('Requesting camera and microphone permissions...');
      
      // Check if we're in a test environment
      const isTestEnvironment = window.location.pathname.includes('test') || window.location.pathname.includes('no-permission');
      
      if (!isTestEnvironment) {
        alert('Please allow camera and microphone access when prompted by your browser.');
      }

      // Request permissions with more specific constraints
      const constraints = {
        video: callType === 'video' ? {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        } : false,
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      };

      console.log('Requesting media access with constraints:', constraints);
      
      // Get user media
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      localStreamRef.current = stream;
      
      if (localVideoRef.current && callType === 'video') {
        localVideoRef.current.srcObject = stream;
      }
      
      // Initialize PeerJS
      await initializePeer();
      
      // Join call room
      if (socket) {
        socket.emit('join-call-room', callId);
      }
      
      setIsConnected(true);
    } catch (error) {
      console.error('Error initializing call:', error);
      
      let errorMessage = 'Failed to access camera/microphone. ';
      
      if (error.name === 'NotAllowedError') {
        errorMessage += 'Please allow camera and microphone permissions and try again.';
      } else if (error.name === 'NotFoundError') {
        errorMessage += 'No camera or microphone found. Please check your device.';
      } else if (error.name === 'NotSupportedError') {
        errorMessage += 'Camera and microphone access is not supported in this browser.';
      } else if (error.name === 'NotReadableError') {
        errorMessage += 'Camera or microphone is being used by another application.';
      } else {
        errorMessage += `Error: ${error.message}`;
      }
      
      alert(errorMessage);
      navigate('/chats');
    }
  };

  const initializePeer = () => {
    return new Promise((resolve, reject) => {
      const config = getNgrokConfig();
      const peerConfig = {
        host: (process.env.REACT_APP_PEER_SERVER_URL && process.env.REACT_APP_PEER_SERVER_URL.split('://')[1] && process.env.REACT_APP_PEER_SERVER_URL.split('://')[1].split(':')[0]) || '10.123.215.217',
        port: 3001,
        path: '/',
        secure: config.isHTTPS
      };
      
      console.log('Initializing PeerJS with config:', peerConfig);
      
      peerRef.current = new Peer(undefined, peerConfig);

      peerRef.current.on('open', (id) => {
        console.log('PeerJS connected with ID:', id);
        setPeerId(id);
        
        // Share peer ID with other participants
        if (socket) {
          socket.emit('share-peer-id', {
            callId,
            peerId: id,
            userId: user.id
          });
        }
        
        resolve();
      });

      peerRef.current.on('call', (call) => {
        console.log('Incoming call received');
        call.answer(localStreamRef.current);
        currentCallRef.current = call;
        setIsCallActive(true);
        
        call.on('stream', (remoteStream) => {
          if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = remoteStream;
          }
        });

        call.on('close', () => {
          console.log('Call ended');
          setIsCallActive(false);
        });
      });

      peerRef.current.on('error', (error) => {
        console.error('PeerJS error:', error);
        reject(error);
      });
    });
  };

  const handlePeerIdShared = (data) => {
    if (data.userId !== user.id && data.peerId) {
      setRemotePeerId(data.peerId);
      // Automatically start the call when we receive the remote peer ID
      startCall(data.peerId);
    }
  };

  const startCall = async (peerId) => {
    if (peerRef.current && localStreamRef.current && peerId) {
      try {
        const call = peerRef.current.call(peerId, localStreamRef.current);
        currentCallRef.current = call;
        setIsCallActive(true);
        
        call.on('stream', (remoteStream) => {
          if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = remoteStream;
          }
        });

        call.on('close', () => {
          console.log('Call ended');
          setIsCallActive(false);
        });
      } catch (error) {
        console.error('Error starting call:', error);
      }
    }
  };

  const handleCallEnded = () => {
    endCall();
    navigate('/chats');
  };

  const toggleVideo = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !isVideoEnabled;
        setIsVideoEnabled(!isVideoEnabled);
      }
    }
  };

  const toggleAudio = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !isAudioEnabled;
        setIsAudioEnabled(!isAudioEnabled);
      }
    }
  };

  const handleEndCall = () => {
    if (currentCallRef.current) {
      currentCallRef.current.close();
    }
    
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
    }
    
    if (peerRef.current) {
      peerRef.current.destroy();
    }
    
    if (socket) {
      socket.emit('leave-call-room', callId);
    }
    
    endCall();
    navigate('/chats');
  };

  return (
    <div className="h-screen bg-black flex flex-col">
      {/* Remote Video */}
      <div className="flex-1 relative">
        {callType === 'video' ? (
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-white">
              <div className="w-32 h-32 bg-gray-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-4xl">👤</span>
              </div>
              <h2 className="text-2xl font-semibold">Voice Call</h2>
              <p className="text-gray-400 mt-2">
                {isCallActive ? 'Call in progress...' : 'Connecting...'}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Local Video (Picture-in-Picture) */}
      {callType === 'video' && (
        <div className="absolute top-4 right-4 w-32 h-24 bg-gray-800 rounded-lg overflow-hidden">
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Call Status */}
      <div className="absolute top-4 left-4 text-white">
        <div className="bg-black bg-opacity-50 px-3 py-2 rounded-lg">
          <p className="text-sm font-semibold">
            {activeCall ? `Calling ${(activeCall.participant && activeCall.participant.name) || 'Unknown'}` : 'Call'}
          </p>
          <p className="text-sm">Type: {callType === 'video' ? 'Video' : 'Voice'}</p>
          <p className="text-sm">Your ID: {peerId}</p>
          <p className="text-sm">Remote ID: {remotePeerId || 'Waiting...'}</p>
          <p className="text-sm">Status: {isCallActive ? 'Connected' : 'Connecting...'}</p>
        </div>
      </div>

      {/* Call Controls */}
      <div className="bg-black bg-opacity-50 p-6">
        <div className="flex justify-center space-x-6">
          <button
            onClick={toggleAudio}
            className={`p-4 rounded-full transition-colors ${
              isAudioEnabled 
                ? 'bg-gray-600 hover:bg-gray-500 text-white' 
                : 'bg-red-600 hover:bg-red-500 text-white'
            }`}
          >
            {isAudioEnabled ? <FaMicrophone className="text-2xl" /> : <FaMicrophoneSlash className="text-2xl" />}
          </button>

          {callType === 'video' && (
            <button
              onClick={toggleVideo}
              className={`p-4 rounded-full transition-colors ${
                isVideoEnabled 
                  ? 'bg-gray-600 hover:bg-gray-500 text-white' 
                  : 'bg-red-600 hover:bg-red-500 text-white'
              }`}
            >
              {isVideoEnabled ? <FaVideo className="text-2xl" /> : <FaVideoSlash className="text-2xl" />}
            </button>
          )}

          <button
            onClick={handleEndCall}
            className="p-4 rounded-full bg-red-600 hover:bg-red-500 text-white transition-colors"
          >
            <FaPhoneSlash className="text-2xl" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CallScreen;