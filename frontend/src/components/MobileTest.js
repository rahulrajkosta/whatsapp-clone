import React, { useState } from 'react';
import { authAPI } from '../services/api';
import getNgrokConfig from '../config/ngrok';

const MobileTest = () => {
  const [testResult, setTestResult] = useState('');
  const [loading, setLoading] = useState(false);

  const testConnection = async () => {
    setLoading(true);
    setTestResult('Testing connection...');
    
    try {
      // Test API connection
      const response = await authAPI.getCurrentUser();
      setTestResult(`✅ API Connection Successful!\nResponse: ${JSON.stringify(response, null, 2)}`);
    } catch (error) {
      setTestResult(`❌ API Connection Failed!\nError: ${error.message}\nDetails: ${JSON.stringify(error.response?.data || error, null, 2)}`);
    } finally {
      setLoading(false);
    }
  };

  const testDirectConnection = async () => {
    setLoading(true);
    setTestResult('Testing direct connection...');
    
    try {
      const { API_URL } = getNgrokConfig();
      const response = await fetch(`${process.env.REACT_APP_API_URL || API_URL}/auth`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const data = await response.text();
      setTestResult(`✅ Direct Connection Successful!\nStatus: ${response.status}\nResponse: ${data}`);
    } catch (error) {
      setTestResult(`❌ Direct Connection Failed!\nError: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Mobile Connectivity Test</h2>
      
      <div className="space-y-4">
        <div className="bg-blue-100 p-4 rounded-lg">
          <h3 className="font-semibold mb-2">Current Configuration:</h3>
          <p><strong>API URL:</strong> {(process.env.REACT_APP_API_URL || getNgrokConfig().API_URL)}</p>
          <p><strong>Server URL:</strong> {(process.env.REACT_APP_SERVER_URL || getNgrokConfig().SERVER_URL)}</p>
          <p><strong>User Agent:</strong> {navigator.userAgent}</p>
        </div>

        <div className="flex space-x-4">
          <button
            onClick={testConnection}
            disabled={loading}
            className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-400"
          >
            Test API Connection
          </button>
          
          <button
            onClick={testDirectConnection}
            disabled={loading}
            className="px-4 py-2 bg-green-500 text-white rounded disabled:bg-gray-400"
          >
            Test Direct Connection
          </button>
        </div>

        {testResult && (
          <div className="bg-gray-100 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">Test Result:</h3>
            <pre className="whitespace-pre-wrap text-sm">{testResult}</pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default MobileTest;
