import React, { useState, useEffect } from 'react';

const BrowserCompatibilityTest = () => {
  const [browserInfo, setBrowserInfo] = useState({});
  const [testResults, setTestResults] = useState({});

  useEffect(() => {
    // Detect browser information
    const userAgent = navigator.userAgent;
    const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
    const isIOS = /iPad|iPhone|iPod/.test(userAgent);
    const isAndroid = /Android/.test(userAgent);
    
    // Detect browser type
    let browserName = 'Unknown';
    let browserVersion = 'Unknown';
    
    if (userAgent.includes('Chrome') && !userAgent.includes('Edge') && !userAgent.includes('OPR')) {
      browserName = 'Chrome';
      const match = userAgent.match(/Chrome\/(\d+)/);
      if (match) browserVersion = match[1];
    } else if (userAgent.includes('Firefox')) {
      browserName = 'Firefox';
      const match = userAgent.match(/Firefox\/(\d+)/);
      if (match) browserVersion = match[1];
    } else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
      browserName = 'Safari';
      const match = userAgent.match(/Version\/(\d+)/);
      if (match) browserVersion = match[1];
    } else if (userAgent.includes('Edge')) {
      browserName = 'Edge';
      const match = userAgent.match(/Edge\/(\d+)/);
      if (match) browserVersion = match[1];
    } else if (userAgent.includes('Trident') || userAgent.includes('MSIE')) {
      browserName = 'Internet Explorer';
    }

    setBrowserInfo({
      userAgent,
      browserName,
      browserVersion,
      isMobile,
      isIOS,
      isAndroid,
      platform: navigator.platform,
      protocol: window.location.protocol,
      hostname: window.location.hostname
    });
  }, []);

  const testBrowserSupport = () => {
    const results = {};

    // Test MediaDevices API
    results.mediaDevices = !!navigator.mediaDevices;
    results.getUserMedia = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
    
    // Test WebRTC
    results.webRTC = !!(window.RTCPeerConnection || window.webkitRTCPeerConnection || window.mozRTCPeerConnection);
    
    // Test Audio Context
    results.audioContext = !!(window.AudioContext || window.webkitAudioContext);
    
    // Test Socket.IO (WebSocket)
    results.webSocket = !!window.WebSocket;
    
    // Test HTTPS
    results.isHTTPS = window.location.protocol === 'https:';
    results.isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    results.isSecureContext = results.isHTTPS || results.isLocalhost;

    setTestResults(results);
  };

  const getRecommendations = () => {
    const recs = [];
    
    if (!testResults.mediaDevices) {
      recs.push('❌ MediaDevices API not supported - Camera/microphone access not available');
      recs.push('💡 Use Chrome Mobile, Safari Mobile, or update your browser');
    }
    
    if (!testResults.getUserMedia) {
      recs.push('❌ getUserMedia not supported - Cannot access camera/microphone');
      recs.push('💡 Update your browser to latest version');
    }
    
    if (!testResults.webRTC) {
      recs.push('❌ WebRTC not supported - Video calls not available');
      recs.push('💡 Use Chrome, Firefox, Safari, or Edge');
    }
    
    if (!testResults.audioContext) {
      recs.push('❌ Audio Context not supported - Ringtone may not work');
      recs.push('💡 Use Chrome Mobile or Safari Mobile');
    }
    
    if (!testResults.webSocket) {
      recs.push('❌ WebSocket not supported - Real-time messaging not available');
      recs.push('💡 Use modern browser');
    }
    
    if (!testResults.isSecureContext) {
      recs.push('❌ Not secure context - Camera access requires HTTPS');
      recs.push('💡 Use https:// instead of http://');
    }

    return recs;
  };

  const getBrowserRecommendations = () => {
    const recs = [];
    
    if (browserInfo.browserName === 'Internet Explorer') {
      recs.push('❌ Internet Explorer is not supported');
      recs.push('💡 Use Chrome, Firefox, Safari, or Edge');
    } else if (browserInfo.browserName === 'Chrome') {
      if (parseInt(browserInfo.browserVersion) < 53) {
        recs.push('❌ Chrome version too old');
        recs.push('💡 Update Chrome to version 53 or later');
      } else {
        recs.push('✅ Chrome version is supported');
      }
    } else if (browserInfo.browserName === 'Firefox') {
      if (parseInt(browserInfo.browserVersion) < 36) {
        recs.push('❌ Firefox version too old');
        recs.push('💡 Update Firefox to version 36 or later');
      } else {
        recs.push('✅ Firefox version is supported');
      }
    } else if (browserInfo.browserName === 'Safari') {
      if (parseInt(browserInfo.browserVersion) < 11) {
        recs.push('❌ Safari version too old');
        recs.push('💡 Update Safari to version 11 or later');
      } else {
        recs.push('✅ Safari version is supported');
      }
    } else {
      recs.push('❓ Unknown browser - May not be supported');
      recs.push('💡 Use Chrome, Firefox, Safari, or Edge');
    }

    return recs;
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">🌐 Browser Compatibility Test</h2>
      
      <div className="space-y-4">
        {/* Browser Information */}
        <div className="bg-blue-100 p-4 rounded-lg">
          <h3 className="font-semibold mb-2">📱 Browser Information</h3>
          <div className="text-sm space-y-1">
            <p><strong>Browser:</strong> {browserInfo.browserName} {browserInfo.browserVersion}</p>
            <p><strong>Device:</strong> {browserInfo.isMobile ? '📱 Mobile' : '💻 Desktop'}</p>
            <p><strong>Platform:</strong> {browserInfo.platform}</p>
            <p><strong>iOS:</strong> {browserInfo.isIOS ? '🍎 Yes' : '❌ No'}</p>
            <p><strong>Android:</strong> {browserInfo.isAndroid ? '🤖 Yes' : '❌ No'}</p>
            <p><strong>Protocol:</strong> {browserInfo.protocol}</p>
            <p><strong>Hostname:</strong> {browserInfo.hostname}</p>
          </div>
        </div>

        {/* Test Button */}
        <div className="bg-green-100 p-4 rounded-lg">
          <h3 className="font-semibold mb-2">🧪 Test Browser Support</h3>
          <button
            onClick={testBrowserSupport}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            🔍 Test Browser Compatibility
          </button>
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
                <span className="font-medium">WebSocket:</span>
                <span className={testResults.webSocket ? 'text-green-600' : 'text-red-600'}>
                  {testResults.webSocket ? '✅ Supported' : '❌ Not Supported'}
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

        {/* Browser Recommendations */}
        <div className="bg-purple-100 p-4 rounded-lg">
          <h3 className="font-semibold mb-2">💡 Browser Recommendations</h3>
          <div className="text-sm space-y-1">
            {getBrowserRecommendations().map((rec, index) => (
              <p key={index}>{rec}</p>
            ))}
          </div>
        </div>

        {/* General Recommendations */}
        <div className="bg-yellow-100 p-4 rounded-lg">
          <h3 className="font-semibold mb-2">💡 General Recommendations</h3>
          <div className="text-sm space-y-1">
            {getRecommendations().map((rec, index) => (
              <p key={index}>{rec}</p>
            ))}
          </div>
        </div>

        {/* Call Flow Test (No Camera Required) */}
        <div className="bg-green-100 p-4 rounded-lg">
          <h3 className="font-semibold mb-2">📞 Test Call Flow (No Camera Required)</h3>
          <p className="text-sm mb-4">Even if camera/microphone doesn't work, you can test the call signaling:</p>
          <a 
            href="/no-permission-call-test" 
            className="px-4 py-2 bg-blue-500 text-white rounded inline-block"
          >
            🧪 Test Call Flow Without Camera
          </a>
        </div>

        {/* Quick Links */}
        <div className="bg-gray-100 p-4 rounded-lg">
          <h3 className="font-semibold mb-2">🔗 Quick Links</h3>
          <div className="text-sm space-y-1">
            <p>• <a href="/no-permission-call-test" className="text-blue-600 underline">No Permission Call Test</a> - Test without camera</p>
            <p>• <a href="/simple-permission-test" className="text-blue-600 underline">Simple Permission Test</a> - Test ringtone</p>
            <p>• <a href="/simple-call-test" className="text-blue-600 underline">Simple Call Test</a> - Basic call test</p>
            <p>• <a href="/call-flow-test" className="text-blue-600 underline">Call Flow Test</a> - Full call test</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BrowserCompatibilityTest;
