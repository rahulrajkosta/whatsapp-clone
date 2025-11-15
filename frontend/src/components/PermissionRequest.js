import React, { useState, useEffect } from 'react';

const PermissionRequest = () => {
  const [permissionStatus, setPermissionStatus] = useState({});
  const [isRequesting, setIsRequesting] = useState(false);
  const [step, setStep] = useState(1);
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

  const requestPermissions = async () => {
    setIsRequesting(true);
    setStep(2);
    
    try {
      // Check if getUserMedia is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera and microphone access is not supported in this browser');
      }

      // Check HTTPS requirement
      if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
        throw new Error('HTTPS is required for camera access. Please use https:// instead of http://');
      }

      console.log('Requesting camera and microphone permissions...');
      
      // Request both camera and microphone permissions
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user'
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });

      // Success!
      setPermissionStatus({
        success: true,
        camera: true,
        microphone: true,
        videoTracks: stream.getVideoTracks().length,
        audioTracks: stream.getAudioTracks().length
      });
      
      setStep(3);
      
      // Stop the stream after a few seconds
      setTimeout(() => {
        stream.getTracks().forEach(track => track.stop());
      }, 3000);

    } catch (error) {
      console.error('Permission request failed:', error);
      
      setPermissionStatus({
        success: false,
        error: error.name,
        message: error.message,
        camera: false,
        microphone: false
      });
      
      setStep(4);
    }
    
    setIsRequesting(false);
  };

  const getPermissionGuide = () => {
    if (deviceInfo.isIOS) {
      return {
        title: "🍎 iOS Permission Guide",
        steps: [
          "1. When prompted, tap 'Allow' for camera access",
          "2. When prompted, tap 'Allow' for microphone access",
          "3. If you accidentally blocked, go to Settings → Safari → Camera → Allow",
          "4. If you accidentally blocked, go to Settings → Safari → Microphone → Allow",
          "5. Refresh the page and try again"
        ]
      };
    } else if (deviceInfo.isAndroid) {
      return {
        title: "🤖 Android Permission Guide",
        steps: [
          "1. When prompted, tap 'Allow' for camera access",
          "2. When prompted, tap 'Allow' for microphone access",
          "3. If you accidentally blocked, tap the lock icon in address bar → Permissions → Allow",
          "4. Or go to Chrome Settings → Site Settings → Camera/Microphone → Allow",
          "5. Refresh the page and try again"
        ]
      };
    } else {
      return {
        title: "💻 Desktop Permission Guide",
        steps: [
          "1. When prompted, click 'Allow' for camera access",
          "2. When prompted, click 'Allow' for microphone access",
          "3. If you accidentally blocked, click the camera icon in address bar → Allow",
          "4. If you accidentally blocked, click the microphone icon in address bar → Allow",
          "5. Refresh the page and try again"
        ]
      };
    }
  };

  const getBrowserSpecificGuide = () => {
    const userAgent = navigator.userAgent.toLowerCase();
    
    if (userAgent.includes('chrome')) {
      return {
        browser: "Chrome",
        steps: [
          "Look for camera/microphone icons in the address bar",
          "Click the icons and select 'Allow'",
          "Or go to chrome://settings/content/camera and chrome://settings/content/microphone"
        ]
      };
    } else if (userAgent.includes('firefox')) {
      return {
        browser: "Firefox",
        steps: [
          "Look for camera/microphone icons in the address bar",
          "Click the icons and select 'Allow'",
          "Or go to about:preferences#privacy → Permissions"
        ]
      };
    } else if (userAgent.includes('safari')) {
      return {
        browser: "Safari",
        steps: [
          "Look for camera/microphone icons in the address bar",
          "Click the icons and select 'Allow'",
          "Or go to Safari → Preferences → Websites → Camera/Microphone"
        ]
      };
    } else {
      return {
        browser: "Your Browser",
        steps: [
          "Look for camera/microphone icons in the address bar",
          "Click the icons and select 'Allow'",
          "Check browser settings for camera/microphone permissions"
        ]
      };
    }
  };

  const resetAndRetry = () => {
    setStep(1);
    setPermissionStatus({});
    setIsRequesting(false);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">🔐 Camera & Microphone Permission Request</h2>
      
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

        {/* Step 1: Request Permissions */}
        {step === 1 && (
          <div className="bg-green-100 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">🚀 Step 1: Request Permissions</h3>
            <p className="mb-4">Click the button below to request camera and microphone permissions. Your browser will show a permission dialog.</p>
            <button
              onClick={requestPermissions}
              disabled={isRequesting}
              className="px-6 py-3 bg-green-500 text-white rounded-lg text-lg font-semibold disabled:bg-gray-400"
            >
              {isRequesting ? 'Requesting...' : '🔐 Request Camera & Microphone Permissions'}
            </button>
          </div>
        )}

        {/* Step 2: Permission Dialog */}
        {step === 2 && (
          <div className="bg-yellow-100 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">⚠️ Step 2: Permission Dialog</h3>
            <p className="mb-4">Your browser should now show a permission dialog. Please:</p>
            <div className="bg-white p-3 rounded border-2 border-yellow-400">
              <p className="font-semibold text-lg">👆 ALLOW CAMERA ACCESS</p>
              <p className="font-semibold text-lg">👆 ALLOW MICROPHONE ACCESS</p>
            </div>
            <p className="mt-4 text-sm text-gray-600">If you don't see a dialog, check the browser address bar for camera/microphone icons.</p>
          </div>
        )}

        {/* Step 3: Success */}
        {step === 3 && (
          <div className="bg-green-100 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">✅ Step 3: Success!</h3>
            <div className="space-y-2">
              <p><strong>Camera:</strong> ✅ Working ({permissionStatus.videoTracks} tracks)</p>
              <p><strong>Microphone:</strong> ✅ Working ({permissionStatus.audioTracks} tracks)</p>
              <p className="text-green-600 font-semibold">🎉 Permissions granted successfully!</p>
            </div>
            <div className="mt-4">
              <a href="/call-flow-test" className="px-4 py-2 bg-blue-500 text-white rounded mr-2">
                Test Video Calls
              </a>
              <a href="/chats" className="px-4 py-2 bg-purple-500 text-white rounded">
                Go to Chats
              </a>
            </div>
          </div>
        )}

        {/* Step 4: Error */}
        {step === 4 && (
          <div className="bg-red-100 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">❌ Step 4: Permission Denied</h3>
            <div className="space-y-2">
              <p><strong>Error:</strong> {permissionStatus.error}</p>
              <p><strong>Message:</strong> {permissionStatus.message}</p>
            </div>
            
            <div className="mt-4">
              <button
                onClick={resetAndRetry}
                className="px-4 py-2 bg-blue-500 text-white rounded mr-2"
              >
                🔄 Try Again
              </button>
            </div>
          </div>
        )}

        {/* Permission Guide */}
        <div className="bg-purple-100 p-4 rounded-lg">
          <h3 className="font-semibold mb-2">{getPermissionGuide().title}</h3>
          <ol className="list-decimal list-inside space-y-1 text-sm">
            {getPermissionGuide().steps.map((step, index) => (
              <li key={index}>{step}</li>
            ))}
          </ol>
        </div>

        {/* Browser-Specific Guide */}
        <div className="bg-orange-100 p-4 rounded-lg">
          <h3 className="font-semibold mb-2">🌐 {getBrowserSpecificGuide().browser} Specific Guide</h3>
          <ul className="list-disc list-inside space-y-1 text-sm">
            {getBrowserSpecificGuide().steps.map((step, index) => (
              <li key={index}>{step}</li>
            ))}
          </ul>
        </div>

        {/* Troubleshooting */}
        <div className="bg-gray-100 p-4 rounded-lg">
          <h3 className="font-semibold mb-2">🔧 Troubleshooting</h3>
          <div className="text-sm space-y-2">
            <p><strong>If you don't see a permission dialog:</strong></p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li>Look for camera/microphone icons in the address bar</li>
              <li>Click the icons and select 'Allow'</li>
              <li>Check if you're using HTTPS (required for mobile)</li>
              <li>Try refreshing the page</li>
            </ul>
            
            <p><strong>If permissions are blocked:</strong></p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li>Check browser settings for camera/microphone permissions</li>
              <li>Try incognito/private mode</li>
              <li>Restart the browser</li>
              <li>Check if other apps are using camera/microphone</li>
            </ul>
          </div>
        </div>

        {/* Quick Links */}
        <div className="bg-blue-100 p-4 rounded-lg">
          <h3 className="font-semibold mb-2">🔗 Quick Links</h3>
          <div className="text-sm space-y-1">
            <p>• <a href="/mobile-diagnostic" className="text-blue-600 underline">Mobile Diagnostic</a> - Check what's wrong</p>
            <p>• <a href="/simple-call-test" className="text-blue-600 underline">Simple Call Test</a> - Test without camera</p>
            <p>• <a href="/call-flow-test" className="text-blue-600 underline">Call Flow Test</a> - Full call test</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PermissionRequest;
