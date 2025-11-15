import React, { useState, useEffect } from 'react';

const SimplePermissionTest = () => {
  const [testResults, setTestResults] = useState({});
  const [isTesting, setIsTesting] = useState(false);
  const [deviceInfo, setDeviceInfo] = useState({});

  useEffect(() => {
    // Detect device info
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

  const testBasicSupport = () => {
    setIsTesting(true);
    const results = {};

    try {
      // Basic browser support
      results.mediaDevices = !!navigator.mediaDevices;
      results.getUserMedia = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
      results.webRTC = !!(window.RTCPeerConnection || window.webkitRTCPeerConnection || window.mozRTCPeerConnection);
      
      // Security context
      results.isHTTPS = window.location.protocol === 'https:';
      results.isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      results.isSecureContext = results.isHTTPS || results.isLocalhost;
      
      // Audio context support (for ringtones)
      results.audioContext = !!(window.AudioContext || window.webkitAudioContext);
      
      // Device capabilities
      results.isMobile = deviceInfo.isMobile;
      results.isIOS = deviceInfo.isIOS;
      results.isAndroid = deviceInfo.isAndroid;

    } catch (error) {
      results.generalError = error.message;
    }

    setTestResults(results);
    setIsTesting(false);
  };

  const testRingtone = () => {
    try {
      // Test ringtone using Web Audio API
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      
      const createTone = (frequency, duration, startTime) => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(frequency, startTime);
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0, startTime);
        gainNode.gain.linearRampToValueAtTime(0.3, startTime + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
        
        oscillator.start(startTime);
        oscillator.stop(startTime + duration);
        
        return oscillator;
      };

      // Play a test ringtone
      const now = audioContext.currentTime;
      createTone(800, 0.4, now);
      createTone(1000, 0.4, now);
      
      alert('🔔 Ringtone test played! You should hear a beep sound.');
      
    } catch (error) {
      alert('❌ Ringtone test failed: ' + error.message);
    }
  };

  const getRecommendations = () => {
    const recs = [];
    
    if (!testResults.isHTTPS && !testResults.isLocalhost) {
      recs.push('🔒 Use HTTPS: Mobile browsers require HTTPS for camera access');
      recs.push('💡 Try: https://' + deviceInfo.hostname + ':3000');
    }
    
    if (!testResults.getUserMedia) {
      recs.push('🌐 Browser not supported - Use Chrome Mobile or Safari Mobile');
    }
    
    if (testResults.isMobile) {
      if (testResults.isIOS) {
        recs.push('🍎 iOS: Use Safari Mobile for best support');
      } else if (testResults.isAndroid) {
        recs.push('🤖 Android: Use Chrome Mobile for best support');
      }
    }
    
    if (!testResults.audioContext) {
      recs.push('🔔 Audio not supported - Ringtone may not work');
    }
    
    return recs;
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">🔔 Simple Permission & Ringtone Test</h2>
      
      <div className="space-y-4">
        {/* Device Info */}
        <div className="bg-blue-100 p-4 rounded-lg">
          <h3 className="font-semibold mb-2">📱 Device Information</h3>
          <div className="text-sm space-y-1">
            <p><strong>Device:</strong> {deviceInfo.isMobile ? '📱 Mobile' : '💻 Desktop'}</p>
            <p><strong>Platform:</strong> {deviceInfo.isIOS ? '🍎 iOS' : deviceInfo.isAndroid ? '🤖 Android' : '❓ Unknown'}</p>
            <p><strong>Protocol:</strong> {deviceInfo.protocol}</p>
            <p><strong>HTTPS:</strong> {deviceInfo.protocol === 'https:' ? '✅ Yes' : '❌ No'}</p>
          </div>
        </div>

        {/* Test Controls */}
        <div className="bg-green-100 p-4 rounded-lg">
          <h3 className="font-semibold mb-2">🧪 Tests</h3>
          <div className="flex flex-col space-y-2">
            <button
              onClick={testBasicSupport}
              disabled={isTesting}
              className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-400"
            >
              {isTesting ? 'Testing...' : '🔍 Test Basic Support'}
            </button>
            <button
              onClick={testRingtone}
              className="px-4 py-2 bg-purple-500 text-white rounded"
            >
              🔔 Test Ringtone
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
                <span className={testResults.mediaDevices ? 'text-green-600' : 'text-red-600'}>
                  {testResults.mediaDevices ? '✅ Supported' : '❌ Not Supported'}
                </span>
              </div>
              
              <div className="flex items-center space-x-2">
                <span className="font-medium">getUserMedia:</span>
                <span className={testResults.getUserMedia ? 'text-green-600' : 'text-red-600'}>
                  {testResults.getUserMedia ? '✅ Supported' : '❌ Not Supported'}
                </span>
              </div>
              
              <div className="flex items-center space-x-2">
                <span className="font-medium">WebRTC:</span>
                <span className={testResults.webRTC ? 'text-green-600' : 'text-red-600'}>
                  {testResults.webRTC ? '✅ Supported' : '❌ Not Supported'}
                </span>
              </div>
              
              <div className="flex items-center space-x-2">
                <span className="font-medium">Audio Context:</span>
                <span className={testResults.audioContext ? 'text-green-600' : 'text-red-600'}>
                  {testResults.audioContext ? '✅ Supported' : '❌ Not Supported'}
                </span>
              </div>
              
              <div className="flex items-center space-x-2">
                <span className="font-medium">Secure Context:</span>
                <span className={testResults.isSecureContext ? 'text-green-600' : 'text-red-600'}>
                  {testResults.isSecureContext ? '✅ Yes' : '❌ No'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Recommendations */}
        <div className="bg-yellow-100 p-4 rounded-lg">
          <h3 className="font-semibold mb-2">💡 Recommendations</h3>
          <div className="text-sm space-y-1">
            {getRecommendations().map((rec, index) => (
              <p key={index}>{rec}</p>
            ))}
          </div>
        </div>

        {/* Call Flow Test */}
        <div className="bg-purple-100 p-4 rounded-lg">
          <h3 className="font-semibold mb-2">📞 Test Call Flow (No Camera Required)</h3>
          <p className="text-sm mb-4">Test the call system without needing camera/microphone permissions:</p>
          <a 
            href="/simple-call-test" 
            className="px-4 py-2 bg-blue-500 text-white rounded inline-block"
          >
            🧪 Test Call Flow
          </a>
        </div>

        {/* Troubleshooting */}
        <div className="bg-red-100 p-4 rounded-lg">
          <h3 className="font-semibold mb-2">🔧 Troubleshooting</h3>
          <div className="text-sm space-y-2">
            <p><strong>If camera/microphone still not working:</strong></p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li>Use Chrome Mobile or Safari Mobile</li>
              <li>Use HTTPS instead of HTTP</li>
              <li>Allow permissions when prompted</li>
              <li>Check browser settings</li>
              <li>Try incognito/private mode</li>
            </ul>
            
            <p><strong>If ringtone not working:</strong></p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li>Check device volume</li>
              <li>Check browser audio permissions</li>
              <li>Try different browser</li>
            </ul>
          </div>
        </div>

        {/* Quick Links */}
        <div className="bg-gray-100 p-4 rounded-lg">
          <h3 className="font-semibold mb-2">🔗 Quick Links</h3>
          <div className="text-sm space-y-1">
            <p>• <a href="/permission-request" className="text-blue-600 underline">Permission Request</a> - Request camera/microphone</p>
            <p>• <a href="/mobile-diagnostic" className="text-blue-600 underline">Mobile Diagnostic</a> - Check what's wrong</p>
            <p>• <a href="/simple-call-test" className="text-blue-600 underline">Simple Call Test</a> - Test without camera</p>
            <p>• <a href="/call-flow-test" className="text-blue-600 underline">Call Flow Test</a> - Full call test</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimplePermissionTest;
