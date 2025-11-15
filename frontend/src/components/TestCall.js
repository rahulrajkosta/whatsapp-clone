import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';
import Peer from 'peerjs';
import getNgrokConfig from '../config/ngrok';

const TestCall = () => {
  const [peerId, setPeerId] = useState('');
  const [remotePeerId, setRemotePeerId] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [callType, setCallType] = useState('video');
  
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerRef = useRef(null);
  const localStreamRef = useRef(null);
  const currentCallRef = useRef(null);
  
  const { user } = useAuth();
  const { socket } = useSocket();

  useEffect(() => {
    initializePeer();
    
    return () => {
      if (peerRef.current) {
        peerRef.current.destroy();
      }
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const initializePeer = () => {
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
    });

    peerRef.current.on('call', (call) => {
      call.answer(localStreamRef.current);
      currentCallRef.current = call;
      setIsConnected(true);
      
      call.on('stream', (remoteStream) => {
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = remoteStream;
        }
      });
    });

    peerRef.current.on('error', (error) => {
      console.error('PeerJS error:', error);
    });
  };

  const startCall = async () => {
    try {
      // Check if getUserMedia is supported with better detection
      if (!navigator.mediaDevices) {
        throw new Error('MediaDevices API is not supported in this browser. Please use Chrome, Firefox, Safari, or Edge.');
      }
      
      if (!navigator.mediaDevices.getUserMedia) {
        throw new Error('getUserMedia is not supported in this browser. Please use Chrome, Firefox, Safari, or Edge.');
      }
      
      // Check for HTTPS requirement
      if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
        throw new Error('Camera and microphone access requires HTTPS. Please use https:// instead of http://');
      }

      // Request permissions with specific constraints
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
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      localStreamRef.current = stream;
      
      if (localVideoRef.current && callType === 'video') {
        localVideoRef.current.srcObject = stream;
      }
      
      if (peerRef.current && remotePeerId) {
        const call = peerRef.current.call(remotePeerId, stream);
        currentCallRef.current = call;
        setIsConnected(true);
        
        call.on('stream', (remoteStream) => {
          if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = remoteStream;
          }
        });
      }
    } catch (error) {
      console.error('Error starting call:', error);
      
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
    }
  };

  const endCall = () => {
    if (currentCallRef.current) {
      currentCallRef.current.close();
    }
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
    }
    setIsConnected(false);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Test Video/Voice Call</h2>
      
      <div className="bg-gray-100 p-4 rounded-lg mb-4">
        <p><strong>Your Peer ID:</strong> {peerId || 'Connecting...'}</p>
        <p><strong>Status:</strong> {isConnected ? 'Connected' : 'Not Connected'}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium mb-2">Remote Peer ID</label>
          <input
            type="text"
            value={remotePeerId}
            onChange={(e) => setRemotePeerId(e.target.value)}
            placeholder="Enter remote peer ID"
            className="w-full p-2 border rounded"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">Call Type</label>
          <select
            value={callType}
            onChange={(e) => setCallType(e.target.value)}
            className="w-full p-2 border rounded"
          >
            <option value="video">Video Call</option>
            <option value="voice">Voice Call</option>
          </select>
        </div>
      </div>

      <div className="flex gap-2 mb-4">
        <button
          onClick={startCall}
          disabled={!remotePeerId || isConnected}
          className="px-4 py-2 bg-green-500 text-white rounded disabled:bg-gray-400"
        >
          Start Call
        </button>
        
        <button
          onClick={endCall}
          disabled={!isConnected}
          className="px-4 py-2 bg-red-500 text-white rounded disabled:bg-gray-400"
        >
          End Call
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h3 className="text-lg font-semibold mb-2">Your Video</h3>
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-48 bg-gray-800 rounded"
          />
        </div>
        
        <div>
          <h3 className="text-lg font-semibold mb-2">Remote Video</h3>
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="w-full h-48 bg-gray-800 rounded"
          />
        </div>
      </div>

      <div className="mt-4 text-sm text-gray-600">
        <p><strong>Instructions:</strong></p>
        <ol className="list-decimal list-inside space-y-1">
          <li>Copy your Peer ID and share it with another user</li>
          <li>Enter the other user's Peer ID in the "Remote Peer ID" field</li>
          <li>Choose video or voice call</li>
          <li>Click "Start Call" to initiate the call</li>
          <li>The other user should see an incoming call and can answer it</li>
        </ol>
      </div>
    </div>
  );
};

export default TestCall;
