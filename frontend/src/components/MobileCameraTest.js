import React, { useState, useEffect } from 'react';

const MobileCameraTest = () => {
  const [testResults, setTestResults] = useState({});
  const [isTesting, setIsTesting] = useState(false);
  const [deviceInfo, setDeviceInfo] = useState({});

  useEffect(() => {
    // Detect mobile device
    const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isAndroid = /Android/.test(navigator.userAgent);
    
    setDeviceInfo({
      isMobile,
      isIOS,
      isAndroid,
      userAgent: navigator.userAgent,
      protocol: window.location.protocol,
      hostname: window.location.hostname
    });
  }, []);

  const testMobilePermissions = async () => {
    setIsTesting(true);
    const results = {};

    try {
      // Check basic support
      results.mediaDevicesSupported = !!navigator.mediaDevices;
      results.getUserMediaSupported = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
      results.isHTTPS = window.location.protocol === 'https:';
      results.isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      results.isSecureContext = results.isHTTPS || results.isLocalhost;

      // Test camera permission
      if (results.getUserMediaSupported && results.isSecureContext) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ 
            video: { 
              width: { ideal: 640 },
              height: { ideal: 480 },
              facingMode: 'user'
            } 
          });
          results.cameraPermission = true;
          results.cameraTracks = stream.getVideoTracks().length;
          stream.getTracks().forEach(track => track.stop());
        } catch (error) {
          results.cameraPermission = false;
          results.cameraError = error.name + ': ' + error.message;
        }
      }

      // Test microphone permission
      if (results.getUserMediaSupported && results.isSecureContext) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ 
            audio: {
              echoCancellation: true,
              noiseSuppression: true
            }
          });
          results.microphonePermission = true;
          results.audioTracks = stream.getAudioTracks().length;
          stream.getTracks().forEach(track => track.stop());
        } catch (error) {
          results.microphonePermission = false;
          results.microphoneError = error.name + ': ' + error.message;
        }
      }

      // Get available devices
      if (results.mediaDevicesSupported) {
        try {
          const devices = await navigator.mediaDevices.enumerateDevices();
          results.devices = devices.map(device => ({
            kind: device.kind,
            label: device.label || 'Unknown Device',
            deviceId: device.deviceId
          }));
        } catch (error) {
          results.devicesError = error.message;
        }
      }

    } catch (error) {
      results.generalError = error.message;
    }

    setTestResults(results);
    setIsTesting(false);
  };

  const requestMobilePermissions = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user'
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true
        }
      });
      
      alert('✅ Permissions granted! Camera and microphone are working.');
      stream.getTracks().forEach(track => track.stop());
      testMobilePermissions(); // Re-run the test
    } catch (error) {
      alert('❌ Permission denied: ' + error.message);
    }
  };

  const getMobileRecommendations = () => {
    const recommendations = [];
    
    if (!deviceInfo.isHTTPS && !deviceInfo.isLocalhost) {
      recommendations.push('🔒 Use HTTPS: Mobile browsers require HTTPS for camera access');
      recommendations.push('💡 Try: https://' + deviceInfo.hostname + ':3000');
    }
    
    if (deviceInfo.isIOS) {
      recommendations.push('📱 iOS: Use Safari Mobile (iOS 11+) for best support');
      recommendations.push('🔧 iOS: Check Settings → Safari → Camera/Microphone permissions');
    }
    
    if (deviceInfo.isAndroid) {
      recommendations.push('📱 Android: Use Chrome Mobile for best support');
      recommendations.push('🔧 Android: Check Chrome settings for camera/microphone permissions');
    }
    
    if (!testResults.getUserMediaSupported) {
      recommendations.push('🌐 Browser: Your mobile browser may not support video calling');
      recommendations.push('💡 Try: Chrome Mobile or Safari Mobile');
    }
    
    return recommendations;
  };

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">📱 Mobile Camera & Microphone Test</h2>
      
      <div className="space-y-4">
        {/* Device Info */}
        <div className="bg-blue-100 p-4 rounded-lg">
          <h3 className="font-semibold mb-2">📱 Device Information</h3>
          <div className="text-sm space-y-1">
            <p><strong>Device:</strong> {deviceInfo.isMobile ? '📱 Mobile' : '💻 Desktop'}</p>
            <p><strong>Platform:</strong> {deviceInfo.isIOS ? '🍎 iOS' : deviceInfo.isAndroid ? '🤖 Android' : '❓ Unknown'}</p>
            <p><strong>Protocol:</strong> {deviceInfo.protocol}</p>
            <p><strong>Hostname:</strong> {deviceInfo.hostname}</p>
            <p><strong>HTTPS:</strong> {deviceInfo.isHTTPS ? '✅ Yes' : '❌ No'}</p>
            <p><strong>Localhost:</strong> {deviceInfo.isLocalhost ? '✅ Yes' : '❌ No'}</p>
          </div>
        </div>

        {/* Test Controls */}
        <div className="bg-green-100 p-4 rounded-lg">
          <h3 className="font-semibold mb-2">🧪 Mobile Permission Test</h3>
          <div className="flex flex-col space-y-2">
            <button
              onClick={testMobilePermissions}
              disabled={isTesting}
              className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-400"
            >
              {isTesting ? 'Testing...' : 'Test Mobile Permissions'}
            </button>
            <button
              onClick={requestMobilePermissions}
              className="px-4 py-2 bg-green-500 text-white rounded"
            >
              Request Mobile Permissions
            </button>
          </div>
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
                <span className="font-medium">Secure Context:</span>
                <span className={testResults.isSecureContext ? 'text-green-600' : 'text-red-600'}>
                  {testResults.isSecureContext ? '✅ Yes' : '❌ No'}
                </span>
              </div>
              
              <div className="flex items-center space-x-2">
                <span className="font-medium">Camera Permission:</span>
                <span className={testResults.cameraPermission ? 'text-green-600' : 'text-red-600'}>
                  {testResults.cameraPermission ? '✅ Yes' : '❌ No'}
                </span>
                {testResults.cameraTracks && (
                  <span className="text-gray-600">({testResults.cameraTracks} tracks)</span>
                )}
              </div>
              
              <div className="flex items-center space-x-2">
                <span className="font-medium">Microphone Permission:</span>
                <span className={testResults.microphonePermission ? 'text-green-600' : 'text-red-600'}>
                  {testResults.microphonePermission ? '✅ Yes' : '❌ No'}
                </span>
                {testResults.audioTracks && (
                  <span className="text-gray-600">({testResults.audioTracks} tracks)</span>
                )}
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

              {testResults.generalError && (
                <div className="text-red-600">
                  <strong>General Error:</strong> {testResults.generalError}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Mobile Recommendations */}
        <div className="bg-yellow-100 p-4 rounded-lg">
          <h3 className="font-semibold mb-2">💡 Mobile Recommendations</h3>
          <div className="text-sm space-y-2">
            {getMobileRecommendations().map((rec, index) => (
              <p key={index}>{rec}</p>
            ))}
          </div>
        </div>

        {/* Mobile Browser Support */}
        <div className="bg-purple-100 p-4 rounded-lg">
          <h3 className="font-semibold mb-2">📱 Mobile Browser Support</h3>
          <div className="text-sm space-y-2">
            <p><strong>✅ Supported Mobile Browsers:</strong></p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li>Chrome Mobile (Android) - Best support</li>
              <li>Safari Mobile (iOS 11+) - Good support</li>
              <li>Samsung Internet - Good support</li>
              <li>Firefox Mobile - Limited support</li>
            </ul>
            
            <p><strong>❌ Not Supported:</strong></p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li>Older mobile browsers</li>
              <li>Some mobile browsers without getUserMedia</li>
            </ul>
          </div>
        </div>

        {/* Mobile Troubleshooting */}
        <div className="bg-red-100 p-4 rounded-lg">
          <h3 className="font-semibold mb-2">🔧 Mobile Troubleshooting</h3>
          <div className="text-sm space-y-2">
            <p><strong>If camera/microphone not working:</strong></p>
            <ol className="list-decimal list-inside ml-4 space-y-1">
              <li>Make sure you're using HTTPS (not HTTP)</li>
              <li>Use Chrome Mobile or Safari Mobile</li>
              <li>Allow permissions when prompted</li>
              <li>Check browser settings for camera/microphone</li>
              <li>Try incognito/private mode</li>
              <li>Restart the browser</li>
              <li>Check if other apps are using camera/microphone</li>
            </ol>
          </div>
        </div>

        {/* Quick Links */}
        <div className="bg-gray-100 p-4 rounded-lg">
          <h3 className="font-semibold mb-2">🔗 Quick Links</h3>
          <div className="text-sm space-y-1">
            <p><strong>Test URLs:</strong></p>
            <p>• Permission Test: <code>http://10.123.215.217:3000/permission-test</code></p>
            <p>• Mobile Test: <code>http://10.123.215.217:3000/mobile-test</code></p>
            <p>• Call Flow Test: <code>http://10.123.215.217:3000/call-flow-test</code></p>
            <p>• Main App: <code>http://10.123.215.217:3000</code></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileCameraTest;
