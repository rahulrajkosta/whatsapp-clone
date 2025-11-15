import React, { useState, useEffect } from 'react';

const PermissionErrorDebug = () => {
  const [debugInfo, setDebugInfo] = useState({});
  const [isTesting, setIsTesting] = useState(false);
  const [testResults, setTestResults] = useState({});

  useEffect(() => {
    // Get initial debug info
    const info = {
      userAgent: navigator.userAgent,
      protocol: window.location.protocol,
      hostname: window.location.hostname,
      isHTTPS: window.location.protocol === 'https:',
      isNgrok: window.location.hostname.includes('ngrok'),
      timestamp: new Date().toISOString()
    };
    setDebugInfo(info);
  }, []);

  const testPermissions = async () => {
    setIsTesting(true);
    const results = {};

    try {
      // Test basic support
      results.mediaDevicesSupported = !!navigator.mediaDevices;
      results.getUserMediaSupported = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
      results.audioContextSupported = !!(window.AudioContext || window.webkitAudioContext);
      
      // Test actual permissions
      if (results.getUserMediaSupported) {
        try {
          console.log('Testing camera permission...');
          const videoStream = await navigator.mediaDevices.getUserMedia({ 
            video: { 
              width: { ideal: 640 },
              height: { ideal: 480 }
            } 
          });
          results.cameraPermission = true;
          results.cameraTracks = videoStream.getVideoTracks().length;
          results.cameraTrackInfo = videoStream.getVideoTracks().map(track => ({
            label: track.label,
            enabled: track.enabled,
            muted: track.muted,
            readyState: track.readyState
          }));
          videoStream.getTracks().forEach(track => track.stop());
        } catch (error) {
          results.cameraPermission = false;
          results.cameraError = {
            name: error.name,
            message: error.message,
            stack: error.stack
          };
        }

        try {
          console.log('Testing microphone permission...');
          const audioStream = await navigator.mediaDevices.getUserMedia({ 
            audio: {
              echoCancellation: true,
              noiseSuppression: true
            }
          });
          results.microphonePermission = true;
          results.audioTracks = audioStream.getAudioTracks().length;
          results.audioTrackInfo = audioStream.getAudioTracks().map(track => ({
            label: track.label,
            enabled: track.enabled,
            muted: track.muted,
            readyState: track.readyState
          }));
          audioStream.getTracks().forEach(track => track.stop());
        } catch (error) {
          results.microphonePermission = false;
          results.microphoneError = {
            name: error.name,
            message: error.message,
            stack: error.stack
          };
        }

        // Test both together
        try {
          console.log('Testing both camera and microphone...');
          const bothStream = await navigator.mediaDevices.getUserMedia({ 
            video: { 
              width: { ideal: 640 },
              height: { ideal: 480 }
            },
            audio: {
              echoCancellation: true,
              noiseSuppression: true
            }
          });
          results.bothPermissions = true;
          results.bothTracks = bothStream.getTracks().length;
          bothStream.getTracks().forEach(track => track.stop());
        } catch (error) {
          results.bothPermissions = false;
          results.bothError = {
            name: error.name,
            message: error.message,
            stack: error.stack
          };
        }
      }

      // Test available devices
      if (results.mediaDevicesSupported) {
        try {
          const devices = await navigator.mediaDevices.enumerateDevices();
          results.devices = devices.map(device => ({
            kind: device.kind,
            label: device.label || 'Unknown Device',
            deviceId: device.deviceId ? 'Present' : 'Missing',
            groupId: device.groupId ? 'Present' : 'Missing'
          }));
        } catch (error) {
          results.devicesError = {
            name: error.name,
            message: error.message,
            stack: error.stack
          };
        }
      }

    } catch (error) {
      results.generalError = {
        name: error.name,
        message: error.message,
        stack: error.stack
      };
    }

    setTestResults(results);
    setIsTesting(false);
  };

  const copyDebugInfo = () => {
    const text = `Permission Error Debug Info:
Browser: ${debugInfo.userAgent}
Protocol: ${debugInfo.protocol}
Hostname: ${debugInfo.hostname}
HTTPS: ${debugInfo.isHTTPS}
Ngrok: ${debugInfo.isNgrok}
Timestamp: ${debugInfo.timestamp}

Test Results:
MediaDevices: ${testResults.mediaDevicesSupported ? 'Supported' : 'Not Supported'}
getUserMedia: ${testResults.getUserMediaSupported ? 'Supported' : 'Not Supported'}
AudioContext: ${testResults.audioContextSupported ? 'Supported' : 'Not Supported'}
Camera Permission: ${testResults.cameraPermission ? 'Working' : 'Failed'}
Microphone Permission: ${testResults.microphonePermission ? 'Working' : 'Failed'}
Both Permissions: ${testResults.bothPermissions ? 'Working' : 'Failed'}

Camera Error: ${testResults.cameraError ? JSON.stringify(testResults.cameraError, null, 2) : 'None'}
Microphone Error: ${testResults.microphoneError ? JSON.stringify(testResults.microphoneError, null, 2) : 'None'}
Both Error: ${testResults.bothError ? JSON.stringify(testResults.bothError, null, 2) : 'None'}
General Error: ${testResults.generalError ? JSON.stringify(testResults.generalError, null, 2) : 'None'}`;
    
    navigator.clipboard.writeText(text).then(() => {
      alert('Debug info copied to clipboard!');
    }).catch(() => {
      alert('Could not copy to clipboard. Please manually copy the results.');
    });
  };

  const getErrorRecommendations = () => {
    const recs = [];
    
    if (testResults.cameraError) {
      const error = testResults.cameraError;
      if (error.name === 'NotAllowedError') {
        recs.push('🔒 Camera permission denied - Allow camera access in browser settings');
      } else if (error.name === 'NotFoundError') {
        recs.push('📹 No camera found - Check if camera is connected');
      } else if (error.name === 'NotReadableError') {
        recs.push('📹 Camera in use - Close other apps using camera');
      } else if (error.name === 'NotSupportedError') {
        recs.push('🌐 Browser not supported - Use Chrome, Firefox, Safari, or Edge');
      } else {
        recs.push(`📹 Camera error: ${error.name} - ${error.message}`);
      }
    }
    
    if (testResults.microphoneError) {
      const error = testResults.microphoneError;
      if (error.name === 'NotAllowedError') {
        recs.push('🔒 Microphone permission denied - Allow microphone access in browser settings');
      } else if (error.name === 'NotFoundError') {
        recs.push('🎤 No microphone found - Check if microphone is connected');
      } else if (error.name === 'NotReadableError') {
        recs.push('🎤 Microphone in use - Close other apps using microphone');
      } else if (error.name === 'NotSupportedError') {
        recs.push('🌐 Browser not supported - Use Chrome, Firefox, Safari, or Edge');
      } else {
        recs.push(`🎤 Microphone error: ${error.name} - ${error.message}`);
      }
    }
    
    if (testResults.bothError) {
      const error = testResults.bothError;
      if (error.name === 'NotAllowedError') {
        recs.push('🔒 Both permissions denied - Allow camera and microphone access');
      } else if (error.name === 'NotFoundError') {
        recs.push('📹🎤 No devices found - Check camera and microphone connections');
      } else if (error.name === 'NotReadableError') {
        recs.push('📹🎤 Devices in use - Close other apps using camera/microphone');
      } else {
        recs.push(`📹🎤 Both error: ${error.name} - ${error.message}`);
      }
    }

    if (!debugInfo.isHTTPS && !debugInfo.isNgrok) {
      recs.push('🔒 HTTPS required - Use HTTPS or ngrok for camera access');
    }
    
    return recs;
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">🔍 Permission Error Debug</h2>
      
      <div className="space-y-4">
        {/* Debug Info */}
        <div className="bg-blue-100 p-4 rounded-lg">
          <h3 className="font-semibold mb-2">📱 Debug Information</h3>
          <div className="text-sm space-y-1">
            <p><strong>Browser:</strong> {debugInfo.userAgent}</p>
            <p><strong>Protocol:</strong> {debugInfo.protocol}</p>
            <p><strong>Hostname:</strong> {debugInfo.hostname}</p>
            <p><strong>HTTPS:</strong> {debugInfo.isHTTPS ? '✅ Yes' : '❌ No'}</p>
            <p><strong>Ngrok:</strong> {debugInfo.isNgrok ? '✅ Yes' : '❌ No'}</p>
            <p><strong>Timestamp:</strong> {debugInfo.timestamp}</p>
          </div>
        </div>

        {/* Test Button */}
        <div className="bg-green-100 p-4 rounded-lg">
          <h3 className="font-semibold mb-2">🧪 Test Permissions</h3>
          <button
            onClick={testPermissions}
            disabled={isTesting}
            className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-400"
          >
            {isTesting ? 'Testing...' : '🔍 Test Permissions & Get Error Details'}
          </button>
        </div>

        {/* Test Results */}
        {Object.keys(testResults).length > 0 && (
          <div className="bg-gray-100 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">📊 Test Results</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center space-x-2">
                <span className="font-medium">MediaDevices API:</span>
                <span className={testResults.mediaDevicesSupported ? 'text-green-600' : 'text-red-600'}>
                  {testResults.mediaDevicesSupported ? '✅ Supported' : '❌ Not Supported'}
                </span>
              </div>
              
              <div className="flex items-center space-x-2">
                <span className="font-medium">getUserMedia:</span>
                <span className={testResults.getUserMediaSupported ? 'text-green-600' : 'text-red-600'}>
                  {testResults.getUserMediaSupported ? '✅ Supported' : '❌ Not Supported'}
                </span>
              </div>
              
              <div className="flex items-center space-x-2">
                <span className="font-medium">AudioContext:</span>
                <span className={testResults.audioContextSupported ? 'text-green-600' : 'text-red-600'}>
                  {testResults.audioContextSupported ? '✅ Supported' : '❌ Not Supported'}
                </span>
              </div>
              
              <div className="flex items-center space-x-2">
                <span className="font-medium">Camera Permission:</span>
                <span className={testResults.cameraPermission ? 'text-green-600' : 'text-red-600'}>
                  {testResults.cameraPermission ? '✅ Working' : '❌ Failed'}
                </span>
                {testResults.cameraTracks && (
                  <span className="text-gray-600">({testResults.cameraTracks} tracks)</span>
                )}
              </div>
              
              <div className="flex items-center space-x-2">
                <span className="font-medium">Microphone Permission:</span>
                <span className={testResults.microphonePermission ? 'text-green-600' : 'text-red-600'}>
                  {testResults.microphonePermission ? '✅ Working' : '❌ Failed'}
                </span>
                {testResults.audioTracks && (
                  <span className="text-gray-600">({testResults.audioTracks} tracks)</span>
                )}
              </div>
              
              <div className="flex items-center space-x-2">
                <span className="font-medium">Both Permissions:</span>
                <span className={testResults.bothPermissions ? 'text-green-600' : 'text-red-600'}>
                  {testResults.bothPermissions ? '✅ Working' : '❌ Failed'}
                </span>
                {testResults.bothTracks && (
                  <span className="text-gray-600">({testResults.bothTracks} tracks)</span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Error Details */}
        {(testResults.cameraError || testResults.microphoneError || testResults.bothError || testResults.generalError) && (
          <div className="bg-red-100 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">❌ Error Details</h3>
            <div className="text-sm space-y-2">
              {testResults.cameraError && (
                <div>
                  <p className="font-medium text-red-600">Camera Error:</p>
                  <pre className="bg-white p-2 rounded text-xs overflow-auto">
                    {JSON.stringify(testResults.cameraError, null, 2)}
                  </pre>
                </div>
              )}
              
              {testResults.microphoneError && (
                <div>
                  <p className="font-medium text-red-600">Microphone Error:</p>
                  <pre className="bg-white p-2 rounded text-xs overflow-auto">
                    {JSON.stringify(testResults.microphoneError, null, 2)}
                  </pre>
                </div>
              )}
              
              {testResults.bothError && (
                <div>
                  <p className="font-medium text-red-600">Both Permissions Error:</p>
                  <pre className="bg-white p-2 rounded text-xs overflow-auto">
                    {JSON.stringify(testResults.bothError, null, 2)}
                  </pre>
                </div>
              )}
              
              {testResults.generalError && (
                <div>
                  <p className="font-medium text-red-600">General Error:</p>
                  <pre className="bg-white p-2 rounded text-xs overflow-auto">
                    {JSON.stringify(testResults.generalError, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Recommendations */}
        <div className="bg-yellow-100 p-4 rounded-lg">
          <h3 className="font-semibold mb-2">💡 Error Recommendations</h3>
          <div className="text-sm space-y-1">
            {getErrorRecommendations().map((rec, index) => (
              <p key={index}>{rec}</p>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="bg-gray-100 p-4 rounded-lg">
          <h3 className="font-semibold mb-2">🔧 Actions</h3>
          <div className="flex flex-col space-y-2">
            <button
              onClick={testPermissions}
              className="px-4 py-2 bg-blue-500 text-white rounded"
            >
              🔄 Test Again
            </button>
            <button
              onClick={copyDebugInfo}
              className="px-4 py-2 bg-green-500 text-white rounded"
            >
              📋 Copy Debug Info
            </button>
          </div>
        </div>

        {/* Quick Links */}
        <div className="bg-purple-100 p-4 rounded-lg">
          <h3 className="font-semibold mb-2">🔗 Quick Links</h3>
          <div className="text-sm space-y-1">
            <p>• <a href="/permission-request" className="text-blue-600 underline">Permission Request</a> - Try requesting permissions again</p>
            <p>• <a href="/no-permission-call-test" className="text-blue-600 underline">No Permission Call Test</a> - Test without camera</p>
            <p>• <a href="/browser-compatibility-test" className="text-blue-600 underline">Browser Compatibility Test</a> - Check browser support</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PermissionErrorDebug;
