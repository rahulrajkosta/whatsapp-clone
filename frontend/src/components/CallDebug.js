import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';
import { useCall } from '../contexts/CallContext';

const CallDebug = () => {
  const [logs, setLogs] = useState([]);
  const [socketEvents, setSocketEvents] = useState([]);
  const { user } = useAuth();
  const { socket, isConnected } = useSocket();
  const { incomingCall, outgoingCall, activeCall, callStatus } = useCall();

  useEffect(() => {
    if (socket) {
      // Listen to all socket events for debugging
      const originalEmit = socket.emit;
      const originalOn = socket.on;

      socket.emit = function(event, ...args) {
        setSocketEvents(prev => [...prev, {
          type: 'EMIT',
          event,
          data: args,
          timestamp: new Date().toLocaleTimeString()
        }]);
        return originalEmit.call(this, event, ...args);
      };

      socket.on = function(event, handler) {
        const wrappedHandler = (...args) => {
          setSocketEvents(prev => [...prev, {
            type: 'RECEIVE',
            event,
            data: args,
            timestamp: new Date().toLocaleTimeString()
          }]);
          return handler(...args);
        };
        return originalOn.call(this, event, wrappedHandler);
      };

      // Listen to call-related events
      socket.on('incoming_call', (data) => {
        setLogs(prev => [...prev, `📞 Incoming call from ${data.caller?.name}: ${JSON.stringify(data)}`]);
      });

      socket.on('call_accepted', (data) => {
        setLogs(prev => [...prev, `✅ Call accepted: ${JSON.stringify(data)}`]);
      });

      socket.on('call_rejected', (data) => {
        setLogs(prev => [...prev, `❌ Call rejected: ${JSON.stringify(data)}`]);
      });

      socket.on('call_ended', (data) => {
        setLogs(prev => [...prev, `📴 Call ended: ${JSON.stringify(data)}`]);
      });

      return () => {
        socket.emit = originalEmit;
        socket.on = originalOn;
      };
    }
  }, [socket]);

  const clearLogs = () => {
    setLogs([]);
    setSocketEvents([]);
  };

  const testCall = () => {
    if (socket) {
      const testCallId = `test_${Date.now()}`;
      socket.emit('initiate_call', {
        callId: testCallId,
        participantId: user.id, // Send to self for testing
        callType: 'video'
      });
      setLogs(prev => [...prev, `🧪 Test call initiated: ${testCallId}`]);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Call Debug Console</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Connection Status */}
        <div className="bg-gray-100 p-4 rounded-lg">
          <h3 className="font-semibold mb-2">Connection Status</h3>
          <p><strong>Socket Connected:</strong> {isConnected ? '✅ Yes' : '❌ No'}</p>
          <p><strong>User ID:</strong> {user?.id || 'Not logged in'}</p>
          <p><strong>User Name:</strong> {user?.name || 'Unknown'}</p>
          <p><strong>Call Status:</strong> {callStatus}</p>
        </div>

        {/* Call States */}
        <div className="bg-gray-100 p-4 rounded-lg">
          <h3 className="font-semibold mb-2">Call States</h3>
          <p><strong>Incoming Call:</strong> {incomingCall ? '✅ Yes' : '❌ No'}</p>
          <p><strong>Outgoing Call:</strong> {outgoingCall ? '✅ Yes' : '❌ No'}</p>
          <p><strong>Active Call:</strong> {activeCall ? '✅ Yes' : '❌ No'}</p>
          {incomingCall && (
            <div className="mt-2 text-sm">
              <p>From: {incomingCall.caller?.name}</p>
              <p>Type: {incomingCall.callType}</p>
            </div>
          )}
        </div>
      </div>

      {/* Test Controls */}
      <div className="mt-6 bg-blue-100 p-4 rounded-lg">
        <h3 className="font-semibold mb-2">Test Controls</h3>
        <div className="flex space-x-4">
          <button
            onClick={testCall}
            className="px-4 py-2 bg-blue-500 text-white rounded"
          >
            Test Call (Self)
          </button>
          <button
            onClick={clearLogs}
            className="px-4 py-2 bg-gray-500 text-white rounded"
          >
            Clear Logs
          </button>
        </div>
      </div>

      {/* Call Logs */}
      <div className="mt-6">
        <h3 className="font-semibold mb-2">Call Events Log</h3>
        <div className="bg-black text-green-400 p-4 rounded-lg h-64 overflow-y-auto font-mono text-sm">
          {logs.length === 0 ? (
            <p className="text-gray-500">No call events yet...</p>
          ) : (
            logs.map((log, index) => (
              <div key={index} className="mb-1">
                {log}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Socket Events */}
      <div className="mt-6">
        <h3 className="font-semibold mb-2">Socket Events (Last 10)</h3>
        <div className="bg-gray-900 text-white p-4 rounded-lg h-64 overflow-y-auto font-mono text-sm">
          {socketEvents.slice(-10).map((event, index) => (
            <div key={index} className="mb-1">
              <span className="text-yellow-400">[{event.timestamp}]</span>
              <span className={event.type === 'EMIT' ? 'text-blue-400' : 'text-green-400'}>
                {event.type}
              </span>
              <span className="text-white"> {event.event}</span>
              <div className="text-gray-400 text-xs ml-4">
                {JSON.stringify(event.data, null, 2)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CallDebug;
