import React, { useState, useEffect } from 'react';
import { getBrowserRecommendations } from '../utils/browserDetection';

const PermissionTest = () => {
  const [testResults, setTestResults] = useState({});
  const [isTesting, setIsTesting] = useState(false);
  const [browserInfo, setBrowserInfo] = useState(null);

  useEffect(() => {
    const info = getBrowserRecommendations();
    setBrowserInfo(info);
  }, []);

  const testPermissions = async () => {
    setIsTesting(true);
    const results = {};

    try {
      // Test if getUserMedia is supported
      if (!navigator.mediaDevices) {
        results.getUserMediaSupported = false;
        results.error = 'MediaDevices API is not supported in this browser';
        results.recommendation = 'Please use Chrome, Firefox, Safari, or Edge';
      } else if (!navigator.mediaDevices.getUserMedia) {
        results.getUserMediaSupported = false;
        results.error = 'getUserMedia is not supported in this browser';
        results.recommendation = 'Please use Chrome, Firefox, Safari, or Edge';
      } else {
        results.getUserMediaSupported = true;
      }

      // Test camera permission
      try {
        const videoStream = await navigator.mediaDevices.getUserMedia({ video: true });
        results.cameraPermission = true;
        results.cameraDevices = videoStream.getVideoTracks().length;
        videoStream.getTracks().forEach(track => track.stop());
      } catch (error) {
        results.cameraPermission = false;
        results.cameraError = error.name + ': ' + error.message;
      }

      // Test microphone permission
      try {
        const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        results.microphonePermission = true;
        results.audioDevices = audioStream.getAudioTracks().length;
        audioStream.getTracks().forEach(track => track.stop());
      } catch (error) {
        results.microphonePermission = false;
        results.microphoneError = error.name + ': ' + error.message;
      }

      // Test both together
      try {
        const bothStream = await navigator.mediaDevices.getUserMedia({ 
          video: true, 
          audio: true 
        });
        results.bothPermissions = true;
        bothStream.getTracks().forEach(track => track.stop());
      } catch (error) {
        results.bothPermissions = false;
        results.bothError = error.name + ': ' + error.message;
      }

      // Get available devices
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        results.availableDevices = devices.map(device => ({
          kind: device.kind,
          label: device.label || 'Unknown Device',
          deviceId: device.deviceId
        }));
      } catch (error) {
        results.devicesError = error.message;
      }

    } catch (error) {
      results.generalError = error.message;
    }

    setTestResults(results);
    setIsTesting(false);
  };

  const requestPermissions = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: true 
      });
      alert('Permissions granted! You can now use video calls.');
      stream.getTracks().forEach(track => track.stop());
      testPermissions(); // Re-run the test
    } catch (error) {
      alert('Permission denied: ' + error.message);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Camera & Microphone Permission Test</h2>
      
      <div className="space-y-4">
        {/* Test Controls */}
        <div className="bg-blue-100 p-4 rounded-lg">
          <h3 className="font-semibold mb-2">Permission Test</h3>
          <div className="flex space-x-4">
            <button
              onClick={testPermissions}
              disabled={isTesting}
              className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-400"
            >
              {isTesting ? 'Testing...' : 'Test Permissions'}
            </button>
            <button
              onClick={requestPermissions}
              className="px-4 py-2 bg-green-500 text-white rounded"
            >
              Request Permissions
            </button>
          </div>
        </div>

        {/* Test Results */}
        {Object.keys(testResults).length > 0 && (
          <div className="bg-gray-100 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">Test Results</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center space-x-2">
                <span className="font-medium">getUserMedia Supported:</span>
                <span className={testResults.getUserMediaSupported ? 'text-green-600' : 'text-red-600'}>
                  {testResults.getUserMediaSupported ? '✅ Yes' : '❌ No'}
                </span>
              </div>
              
              {testResults.error && (
                <div className="text-red-600">
                  <strong>Error:</strong> {testResults.error}
                </div>
              )}
              
              {testResults.recommendation && (
                <div className="text-blue-600">
                  <strong>Recommendation:</strong> {testResults.recommendation}
                </div>
              )}
              
              <div className="flex items-center space-x-2">
                <span className="font-medium">Camera Permission:</span>
                <span className={testResults.cameraPermission ? 'text-green-600' : 'text-red-600'}>
                  {testResults.cameraPermission ? '✅ Yes' : '❌ No'}
                </span>
                {testResults.cameraDevices && (
                  <span className="text-gray-600">({testResults.cameraDevices} devices)</span>
                )}
              </div>
              
              <div className="flex items-center space-x-2">
                <span className="font-medium">Microphone Permission:</span>
                <span className={testResults.microphonePermission ? 'text-green-600' : 'text-red-600'}>
                  {testResults.microphonePermission ? '✅ Yes' : '❌ No'}
                </span>
                {testResults.audioDevices && (
                  <span className="text-gray-600">({testResults.audioDevices} devices)</span>
                )}
              </div>
              
              <div className="flex items-center space-x-2">
                <span className="font-medium">Both Permissions:</span>
                <span className={testResults.bothPermissions ? 'text-green-600' : 'text-red-600'}>
                  {testResults.bothPermissions ? '✅ Yes' : '❌ No'}
                </span>
              </div>

              {/* Error Messages */}
              {testResults.cameraError && (
                <div className="text-red-600">
                  <strong>Camera Error:</strong> {testResults.cameraError}
                </div>
              )}
              
              {testResults.microphoneError && (
                <div className="text-red-600">
                  <strong>Microphone Error:</strong> {testResults.microphoneError}
                </div>
              )}
              
              {testResults.bothError && (
                <div className="text-red-600">
                  <strong>Both Permissions Error:</strong> {testResults.bothError}
                </div>
              )}

              {testResults.generalError && (
                <div className="text-red-600">
                  <strong>General Error:</strong> {testResults.generalError}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Available Devices */}
        {testResults.availableDevices && (
          <div className="bg-gray-100 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">Available Devices</h3>
            <div className="space-y-1 text-sm">
              {testResults.availableDevices.map((device, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <span className="font-medium">{device.kind}:</span>
                  <span>{device.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Troubleshooting Guide */}
        <div className="bg-yellow-100 p-4 rounded-lg">
          <h3 className="font-semibold mb-2">Troubleshooting Guide</h3>
          <div className="text-sm space-y-2">
            <p><strong>If permissions are denied:</strong></p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li>Click the camera/microphone icon in your browser's address bar</li>
              <li>Select "Allow" for camera and microphone access</li>
              <li>Refresh the page and try again</li>
              <li>Make sure no other app is using your camera/microphone</li>
            </ul>
            
            <p><strong>For mobile devices:</strong></p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li>Use Chrome or Safari browser</li>
              <li>Make sure you're on HTTPS (not HTTP)</li>
              <li>Check browser settings for camera/microphone permissions</li>
              <li>Try incognito/private mode</li>
            </ul>
          </div>
        </div>

        {/* Browser Detection */}
        {browserInfo && (
          <div className="bg-purple-100 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">Browser Detection</h3>
            <div className="text-sm space-y-1">
              <p><strong>Browser:</strong> {browserInfo.browser.name} {browserInfo.browser.version}</p>
              <p><strong>Mobile:</strong> {browserInfo.browser.isMobile ? '✅ Yes' : '❌ No'}</p>
              <p><strong>Supported:</strong> {browserInfo.browser.isSupported ? '✅ Yes' : '❌ No'}</p>
              <p><strong>MediaDevices API:</strong> {browserInfo.support.mediaDevices ? '✅ Supported' : '❌ Not Supported'}</p>
              <p><strong>getUserMedia:</strong> {browserInfo.support.getUserMedia ? '✅ Supported' : '❌ Not Supported'}</p>
              <p><strong>Secure Context:</strong> {browserInfo.support.isSecureContext ? '✅ Yes' : '❌ No'}</p>
              <p><strong>HTTPS:</strong> {browserInfo.support.isHTTPS ? '✅ Yes' : '❌ No'}</p>
            </div>
            
            {browserInfo.recommendations.length > 0 && (
              <div className="mt-2">
                <p className="font-medium text-red-600">Recommendations:</p>
                <ul className="list-disc list-inside text-sm text-red-600">
                  {browserInfo.recommendations.map((rec, index) => (
                    <li key={index}>{rec}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Browser Info */}
        <div className="bg-gray-100 p-4 rounded-lg">
          <h3 className="font-semibold mb-2">Technical Details</h3>
          <div className="text-sm space-y-1">
            <p><strong>User Agent:</strong> {navigator.userAgent}</p>
            <p><strong>Protocol:</strong> {window.location.protocol}</p>
            <p><strong>Hostname:</strong> {window.location.hostname}</p>
          </div>
        </div>

        {/* Browser Compatibility */}
        <div className="bg-blue-100 p-4 rounded-lg">
          <h3 className="font-semibold mb-2">Browser Compatibility</h3>
          <div className="text-sm space-y-2">
            <p><strong>Supported Browsers:</strong></p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li>✅ Chrome 53+ (Desktop & Mobile)</li>
              <li>✅ Firefox 36+ (Desktop & Mobile)</li>
              <li>✅ Safari 11+ (Desktop & Mobile)</li>
              <li>✅ Edge 12+ (Desktop)</li>
              <li>❌ Internet Explorer (Not Supported)</li>
            </ul>
            
            <p><strong>Mobile Browser Support:</strong></p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li>✅ Chrome Mobile (Android)</li>
              <li>✅ Safari Mobile (iOS 11+)</li>
              <li>✅ Samsung Internet</li>
              <li>❌ Some older mobile browsers</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PermissionTest;
