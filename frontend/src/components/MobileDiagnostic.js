import React, { useState, useEffect } from 'react';

const MobileDiagnostic = () => {
  const [diagnostics, setDiagnostics] = useState({});
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    runDiagnostics();
  }, []);

  const runDiagnostics = async () => {
    setIsRunning(true);
    const results = {};

    try {
      // Basic device info
      results.userAgent = navigator.userAgent;
      results.platform = navigator.platform;
      results.isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      results.isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      results.isAndroid = /Android/.test(navigator.userAgent);
      
      // URL info
      results.protocol = window.location.protocol;
      results.hostname = window.location.hostname;
      results.port = window.location.port;
      results.fullUrl = window.location.href;
      
      // Browser capabilities
      results.mediaDevices = !!navigator.mediaDevices;
      results.getUserMedia = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
      results.webRTC = !!(window.RTCPeerConnection || window.webkitRTCPeerConnection || window.mozRTCPeerConnection);
      
      // Security context
      results.isSecureContext = window.isSecureContext;
      results.isHTTPS = window.location.protocol === 'https:';
      results.isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      
      // Test actual permissions
      if (results.getUserMedia && (results.isHTTPS || results.isLocalhost)) {
        try {
          // Test camera
          const videoStream = await navigator.mediaDevices.getUserMedia({ 
            video: { 
              width: { ideal: 320 },
              height: { ideal: 240 }
            } 
          });
          results.cameraWorks = true;
          results.cameraTracks = videoStream.getVideoTracks().length;
          videoStream.getTracks().forEach(track => track.stop());
        } catch (error) {
          results.cameraWorks = false;
          results.cameraError = error.name + ': ' + error.message;
        }

        try {
          // Test microphone
          const audioStream = await navigator.mediaDevices.getUserMedia({ 
            audio: true 
          });
          results.microphoneWorks = true;
          results.audioTracks = audioStream.getAudioTracks().length;
          audioStream.getTracks().forEach(track => track.stop());
        } catch (error) {
          results.microphoneWorks = false;
          results.microphoneError = error.name + ': ' + error.message;
        }
      }

      // Get available devices
      if (results.mediaDevices) {
        try {
          const devices = await navigator.mediaDevices.enumerateDevices();
          results.devices = devices.map(device => ({
            kind: device.kind,
            label: device.label || 'Unknown Device',
            deviceId: device.deviceId ? 'Present' : 'Missing'
          }));
        } catch (error) {
          results.devicesError = error.message;
        }
      }

    } catch (error) {
      results.generalError = error.message;
    }

    setDiagnostics(results);
    setIsRunning(false);
  };

  const getRecommendations = () => {
    const recs = [];
    
    if (!diagnostics.isHTTPS && !diagnostics.isLocalhost) {
      recs.push('🔒 CRITICAL: Use HTTPS - Mobile browsers require HTTPS for camera access');
      recs.push('💡 Try: https://' + diagnostics.hostname + ':3000');
    }
    
    if (!diagnostics.getUserMedia) {
      recs.push('🌐 Browser not supported - Use Chrome Mobile or Safari Mobile');
    }
    
    if (diagnostics.isAndroid && !diagnostics.userAgent.includes('Chrome')) {
      recs.push('📱 Android: Use Chrome Mobile for best support');
    }
    
    if (diagnostics.isIOS && !diagnostics.userAgent.includes('Safari')) {
      recs.push('🍎 iOS: Use Safari Mobile for best support');
    }
    
    if (diagnostics.cameraError) {
      recs.push('📹 Camera issue: ' + diagnostics.cameraError);
    }
    
    if (diagnostics.microphoneError) {
      recs.push('🎤 Microphone issue: ' + diagnostics.microphoneError);
    }
    
    return recs;
  };

  const copyDiagnostics = () => {
    const text = `Mobile Diagnostic Results:
Device: ${diagnostics.isMobile ? 'Mobile' : 'Desktop'}
Platform: ${diagnostics.platform}
Browser: ${diagnostics.userAgent}
URL: ${diagnostics.fullUrl}
HTTPS: ${diagnostics.isHTTPS ? 'Yes' : 'No'}
MediaDevices: ${diagnostics.mediaDevices ? 'Supported' : 'Not Supported'}
getUserMedia: ${diagnostics.getUserMedia ? 'Supported' : 'Not Supported'}
Camera: ${diagnostics.cameraWorks ? 'Working' : 'Not Working'}
Microphone: ${diagnostics.microphoneWorks ? 'Working' : 'Not Working'}
Camera Error: ${diagnostics.cameraError || 'None'}
Microphone Error: ${diagnostics.microphoneError || 'None'}`;
    
    navigator.clipboard.writeText(text).then(() => {
      alert('Diagnostics copied to clipboard!');
    }).catch(() => {
      alert('Could not copy to clipboard. Please manually copy the results.');
    });
  };

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">🔍 Mobile Diagnostic Tool</h2>
      
      {isRunning ? (
        <div className="text-center py-8">
          <div className="text-lg">Running diagnostics...</div>
          <div className="text-sm text-gray-600 mt-2">This may take a few seconds</div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Device Info */}
          <div className="bg-blue-100 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">📱 Device Information</h3>
            <div className="text-sm space-y-1">
              <p><strong>Device Type:</strong> {diagnostics.isMobile ? '📱 Mobile' : '💻 Desktop'}</p>
              <p><strong>Platform:</strong> {diagnostics.platform}</p>
              <p><strong>iOS:</strong> {diagnostics.isIOS ? '🍎 Yes' : '❌ No'}</p>
              <p><strong>Android:</strong> {diagnostics.isAndroid ? '🤖 Yes' : '❌ No'}</p>
              <p><strong>User Agent:</strong> <code className="text-xs">{diagnostics.userAgent}</code></p>
            </div>
          </div>

          {/* URL Info */}
          <div className="bg-green-100 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">🌐 URL Information</h3>
            <div className="text-sm space-y-1">
              <p><strong>Protocol:</strong> {diagnostics.protocol}</p>
              <p><strong>Hostname:</strong> {diagnostics.hostname}</p>
              <p><strong>Port:</strong> {diagnostics.port}</p>
              <p><strong>Full URL:</strong> <code className="text-xs">{diagnostics.fullUrl}</code></p>
              <p><strong>HTTPS:</strong> {diagnostics.isHTTPS ? '✅ Yes' : '❌ No'}</p>
              <p><strong>Localhost:</strong> {diagnostics.isLocalhost ? '✅ Yes' : '❌ No'}</p>
              <p><strong>Secure Context:</strong> {diagnostics.isSecureContext ? '✅ Yes' : '❌ No'}</p>
            </div>
          </div>

          {/* Browser Capabilities */}
          <div className="bg-purple-100 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">🔧 Browser Capabilities</h3>
            <div className="text-sm space-y-1">
              <p><strong>MediaDevices API:</strong> {diagnostics.mediaDevices ? '✅ Supported' : '❌ Not Supported'}</p>
              <p><strong>getUserMedia:</strong> {diagnostics.getUserMedia ? '✅ Supported' : '❌ Not Supported'}</p>
              <p><strong>WebRTC:</strong> {diagnostics.webRTC ? '✅ Supported' : '❌ Not Supported'}</p>
            </div>
          </div>

          {/* Permission Test Results */}
          <div className="bg-yellow-100 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">🧪 Permission Test Results</h3>
            <div className="text-sm space-y-1">
              <p><strong>Camera:</strong> {diagnostics.cameraWorks ? '✅ Working' : '❌ Not Working'}</p>
              {diagnostics.cameraTracks && <p><strong>Camera Tracks:</strong> {diagnostics.cameraTracks}</p>}
              {diagnostics.cameraError && <p><strong>Camera Error:</strong> <span className="text-red-600">{diagnostics.cameraError}</span></p>}
              
              <p><strong>Microphone:</strong> {diagnostics.microphoneWorks ? '✅ Working' : '❌ Not Working'}</p>
              {diagnostics.audioTracks && <p><strong>Audio Tracks:</strong> {diagnostics.audioTracks}</p>}
              {diagnostics.microphoneError && <p><strong>Microphone Error:</strong> <span className="text-red-600">{diagnostics.microphoneError}</span></p>}
            </div>
          </div>

          {/* Available Devices */}
          {diagnostics.devices && (
            <div className="bg-gray-100 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">📱 Available Devices</h3>
              <div className="text-sm space-y-1">
                {diagnostics.devices.map((device, index) => (
                  <p key={index}><strong>{device.kind}:</strong> {device.label} ({device.deviceId})</p>
                ))}
              </div>
            </div>
          )}

          {/* Recommendations */}
          <div className="bg-red-100 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">💡 Recommendations</h3>
            <div className="text-sm space-y-1">
              {getRecommendations().map((rec, index) => (
                <p key={index}>{rec}</p>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="bg-gray-100 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">🔧 Actions</h3>
            <div className="flex flex-col space-y-2">
              <button
                onClick={runDiagnostics}
                className="px-4 py-2 bg-blue-500 text-white rounded"
              >
                🔄 Run Diagnostics Again
              </button>
              <button
                onClick={copyDiagnostics}
                className="px-4 py-2 bg-green-500 text-white rounded"
              >
                📋 Copy Results
              </button>
            </div>
          </div>

          {/* Quick Fixes */}
          <div className="bg-orange-100 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">🚀 Quick Fixes</h3>
            <div className="text-sm space-y-2">
              <p><strong>If HTTPS error:</strong></p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>Try: <code>https://10.123.215.217:3000/mobile-diagnostic</code></li>
                <li>Or: <code>http://localhost:3000/mobile-diagnostic</code></li>
              </ul>
              
              <p><strong>If browser not supported:</strong></p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>Android: Use Chrome Mobile</li>
                <li>iOS: Use Safari Mobile</li>
              </ul>
              
              <p><strong>If permissions denied:</strong></p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>Allow when prompted</li>
                <li>Check browser settings</li>
                <li>Try incognito mode</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MobileDiagnostic;
