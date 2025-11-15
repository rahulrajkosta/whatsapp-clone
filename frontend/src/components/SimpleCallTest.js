import React, { useState } from 'react';
import { useCall } from '../contexts/CallContext';
import { useAuth } from '../contexts/AuthContext';

const SimpleCallTest = () => {
  const [testUserId, setTestUserId] = useState('');
  const [callType, setCallType] = useState('voice');
  const { initiateCall, incomingCall, outgoingCall, activeCall, callStatus, acceptCall, rejectCall } = useCall();
  const { user } = useAuth();

  const testCall = () => {
    if (testUserId) {
      initiateCall(testUserId, callType);
    } else {
      alert('Please enter a user ID to test with');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'idle': return 'text-gray-600';
      case 'calling': return 'text-blue-600';
      case 'ringing': return 'text-yellow-600';
      case 'connected': return 'text-green-600';
      case 'ended': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">📞 Simple Call Test (No Camera Required)</h2>
      
      <div className="space-y-4">
        {/* User Info */}
        <div className="bg-blue-100 p-4 rounded-lg">
          <h3 className="font-semibold mb-2">👤 Current User</h3>
          <p><strong>Name:</strong> {user?.name || 'Not logged in'}</p>
          <p><strong>Email:</strong> {user?.email || 'Not logged in'}</p>
          <p><strong>ID:</strong> {user?.id || 'Not logged in'}</p>
        </div>

        {/* Call Test */}
        <div className="bg-green-100 p-4 rounded-lg">
          <h3 className="font-semibold mb-2">🧪 Test Call</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium mb-1">User ID to call:</label>
              <input
                type="text"
                value={testUserId}
                onChange={(e) => setTestUserId(e.target.value)}
                placeholder="Enter user ID from another device"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Call Type:</label>
              <select
                value={callType}
                onChange={(e) => setCallType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="voice">Voice Call</option>
                <option value="video">Video Call</option>
              </select>
            </div>
            
            <button
              onClick={testCall}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              📞 Start Test Call
            </button>
          </div>
        </div>

        {/* Call Status */}
        <div className="bg-gray-100 p-4 rounded-lg">
          <h3 className="font-semibold mb-2">📊 Call Status</h3>
          <div className="space-y-2 text-sm">
            <p><strong>Status:</strong> <span className={getStatusColor(callStatus)}>{callStatus}</span></p>
            <p><strong>Incoming Call:</strong> {incomingCall ? '✅ Yes' : '❌ No'}</p>
            <p><strong>Outgoing Call:</strong> {outgoingCall ? '✅ Yes' : '❌ No'}</p>
            <p><strong>Active Call:</strong> {activeCall ? '✅ Yes' : '❌ No'}</p>
          </div>
        </div>

        {/* Incoming Call Actions */}
        {incomingCall && (
          <div className="bg-yellow-100 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">📞 Incoming Call</h3>
            <div className="space-y-2">
              <p><strong>From:</strong> {incomingCall.caller?.name || 'Unknown'}</p>
              <p><strong>Type:</strong> {incomingCall.callType}</p>
              <p><strong>Call ID:</strong> {incomingCall.id}</p>
              <div className="flex space-x-2">
                <button
                  onClick={acceptCall}
                  className="px-4 py-2 bg-green-500 text-white rounded"
                >
                  ✅ Accept Call
                </button>
                <button
                  onClick={rejectCall}
                  className="px-4 py-2 bg-red-500 text-white rounded"
                >
                  ❌ Reject Call
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Outgoing Call Status */}
        {outgoingCall && (
          <div className="bg-blue-100 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">📞 Outgoing Call</h3>
            <div className="space-y-2">
              <p><strong>To:</strong> {outgoingCall.participantId}</p>
              <p><strong>Type:</strong> {outgoingCall.callType}</p>
              <p><strong>Call ID:</strong> {outgoingCall.id}</p>
              <p><strong>Status:</strong> Calling...</p>
            </div>
          </div>
        )}

        {/* Active Call */}
        {activeCall && (
          <div className="bg-green-100 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">✅ Active Call</h3>
            <div className="space-y-2">
              <p><strong>With:</strong> {activeCall.participant?.name || 'Unknown'}</p>
              <p><strong>Type:</strong> {activeCall.callType}</p>
              <p><strong>Call ID:</strong> {activeCall.id}</p>
              <p><strong>Status:</strong> Connected</p>
              <div className="text-sm text-gray-600">
                <p>Note: This is a call flow test. For actual video/audio, you need camera/microphone permissions.</p>
              </div>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="bg-purple-100 p-4 rounded-lg">
          <h3 className="font-semibold mb-2">📋 How to Test</h3>
          <ol className="list-decimal list-inside space-y-1 text-sm">
            <li>Open this page on two different devices/browsers</li>
            <li>Register different users on each device</li>
            <li>Copy the user ID from one device</li>
            <li>Paste it in the other device and click "Start Test Call"</li>
            <li>Accept the call on the receiving device</li>
            <li>Check if the call status changes to "connected"</li>
          </ol>
        </div>

        {/* Troubleshooting */}
        <div className="bg-red-100 p-4 rounded-lg">
          <h3 className="font-semibold mb-2">🔧 Troubleshooting</h3>
          <div className="text-sm space-y-2">
            <p><strong>If call doesn't work:</strong></p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li>Make sure both devices are connected to the same network</li>
              <li>Check if Socket.IO is working (look for connection status)</li>
              <li>Try refreshing both pages</li>
              <li>Check browser console for errors</li>
            </ul>
            
            <p><strong>For actual video/audio calls:</strong></p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li>Fix camera/microphone permissions first</li>
              <li>Use HTTPS for mobile devices</li>
              <li>Use supported browsers (Chrome, Safari, Firefox, Edge)</li>
            </ul>
          </div>
        </div>

        {/* Quick Links */}
        <div className="bg-gray-100 p-4 rounded-lg">
          <h3 className="font-semibold mb-2">🔗 Quick Links</h3>
          <div className="text-sm space-y-1">
            <p>• <a href="/mobile-diagnostic" className="text-blue-600 underline">Mobile Diagnostic</a> - Check what's wrong</p>
            <p>• <a href="/mobile-camera-test" className="text-blue-600 underline">Mobile Camera Test</a> - Test camera/microphone</p>
            <p>• <a href="/permission-test" className="text-blue-600 underline">Permission Test</a> - Test permissions</p>
            <p>• <a href="/call-flow-test" className="text-blue-600 underline">Call Flow Test</a> - Full call test</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimpleCallTest;
