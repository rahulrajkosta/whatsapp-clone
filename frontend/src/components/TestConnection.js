import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';
import { authAPI } from '../services/api';

const TestConnection = () => {
  const [apiStatus, setApiStatus] = useState('Testing...');
  const [socketStatus, setSocketStatus] = useState('Testing...');
  const [userStatus, setUserStatus] = useState('Testing...');
  
  const { user } = useAuth();
  const { socket, isConnected } = useSocket();

  useEffect(() => {
    testAPI();
    testSocket();
    testUser();
  }, []);

  useEffect(() => {
    setSocketStatus(isConnected ? '✅ Connected' : '❌ Disconnected');
  }, [isConnected]);

  const testAPI = async () => {
    try {
      await authAPI.getCurrentUser();
      setApiStatus('✅ API Connected');
    } catch (error) {
      setApiStatus('❌ API Failed');
    }
  };

  const testSocket = () => {
    if (socket) {
      setSocketStatus('✅ Socket Connected');
    } else {
      setSocketStatus('❌ Socket Failed');
    }
  };

  const testUser = () => {
    if (user) {
      setUserStatus('✅ User Authenticated');
    } else {
      setUserStatus('❌ User Not Authenticated');
    }
  };

  return (
    <div className="fixed bottom-4 right-4 bg-white p-4 rounded-lg shadow-lg border max-w-sm">
      <h3 className="font-semibold text-gray-800 mb-2">Connection Status</h3>
      <div className="space-y-1 text-sm">
        <div>API: {apiStatus}</div>
        <div>Socket: {socketStatus}</div>
        <div>User: {userStatus}</div>
      </div>
    </div>
  );
};

export default TestConnection;
