import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCall } from '../contexts/CallContext';
import { useAuth } from '../contexts/AuthContext';

const CallFlowTest = () => {
  const [testUserId, setTestUserId] = useState('');
  const { initiateCall, incomingCall, outgoingCall, activeCall, callStatus, acceptCall, rejectCall } = useCall();
  const { user } = useAuth();
  const navigate = useNavigate();

  const testCall = () => {
    if (testUserId) {
      initiateCall(testUserId, 'video');
    } else {
      alert('Please enter a user ID to test with');
    }
  };

  const testSelfCall = () => {
    initiateCall(user.id, 'video');
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Call Flow Test</h2>
      
      <div className="space-y-4">
        {/* Current State */}
        <div className="bg-gray-100 p-4 rounded-lg">
          <h3 className="font-semibold mb-2">Current Call State</h3>
          <p><strong>Call Status:</strong> {callStatus}</p>
          <p><strong>Incoming Call:</strong> {incomingCall ? 'Yes' : 'No'}</p>
          <p><strong>Outgoing Call:</strong> {outgoingCall ? 'Yes' : 'No'}</p>
          <p><strong>Active Call:</strong> {activeCall ? 'Yes' : 'No'}</p>
          {incomingCall && (
            <div className="mt-2 text-sm">
              <p>From: {incomingCall.caller?.name}</p>
              <p>Type: {incomingCall.callType}</p>
              <p>ID: {incomingCall.id}</p>
            </div>
          )}
        </div>

        {/* Test Controls */}
        <div className="bg-blue-100 p-4 rounded-lg">
          <h3 className="font-semibold mb-2">Test Controls</h3>
          <div className="space-y-2">
            <div>
              <label className="block text-sm font-medium mb-1">Test User ID:</label>
              <input
                type="text"
                value={testUserId}
                onChange={(e) => setTestUserId(e.target.value)}
                placeholder="Enter user ID to call"
                className="w-full p-2 border rounded"
              />
            </div>
            <div className="flex space-x-2">
              <button
                onClick={testCall}
                className="px-4 py-2 bg-blue-500 text-white rounded"
              >
                Test Call
              </button>
              <button
                onClick={testSelfCall}
                className="px-4 py-2 bg-green-500 text-white rounded"
              >
                Test Self Call
              </button>
            </div>
          </div>
        </div>

        {/* Incoming Call Actions */}
        {incomingCall && (
          <div className="bg-yellow-100 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">Incoming Call Actions</h3>
            <div className="flex space-x-2">
              <button
                onClick={acceptCall}
                className="px-4 py-2 bg-green-500 text-white rounded"
              >
                Accept Call
              </button>
              <button
                onClick={rejectCall}
                className="px-4 py-2 bg-red-500 text-white rounded"
              >
                Reject Call
              </button>
            </div>
          </div>
        )}

        {/* Active Call Actions */}
        {activeCall && (
          <div className="bg-green-100 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">Active Call Actions</h3>
            <div className="flex space-x-2">
              <button
                onClick={() => navigate(`/call/${activeCall.id}?type=${activeCall.callType}`)}
                className="px-4 py-2 bg-blue-500 text-white rounded"
              >
                Go to Call Screen
              </button>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="bg-gray-100 p-4 rounded-lg">
          <h3 className="font-semibold mb-2">How to Test:</h3>
          <ol className="list-decimal list-inside space-y-1 text-sm">
            <li>Open this page on two different devices/browsers</li>
            <li>Register different users on each device</li>
            <li>Copy the user ID from one device</li>
            <li>Paste it in the "Test User ID" field on the other device</li>
            <li>Click "Test Call" on one device</li>
            <li>The other device should show an incoming call notification</li>
            <li>Click "Accept Call" to complete the call flow</li>
          </ol>
        </div>

        {/* Current User Info */}
        <div className="bg-gray-100 p-4 rounded-lg">
          <h3 className="font-semibold mb-2">Current User Info</h3>
          <p><strong>User ID:</strong> {user?.id}</p>
          <p><strong>User Name:</strong> {user?.name}</p>
          <p><strong>User Email:</strong> {user?.email}</p>
        </div>
      </div>
    </div>
  );
};

export default CallFlowTest;
