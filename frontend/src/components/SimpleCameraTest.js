import React, { useState } from 'react';

const SimpleCameraTest = () => {
  const [result, setResult] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const testCamera = async () => {
    setIsLoading(true);
    setResult('Testing camera...\n');

    try {
      // Check basic support
      if (!navigator.mediaDevices) {
        setResult(prev => prev + '❌ MediaDevices API not supported\n');
        return;
      }

      if (!navigator.mediaDevices.getUserMedia) {
        setResult(prev => prev + '❌ getUserMedia not supported\n');
        return;
      }

      setResult(prev => prev + '✅ MediaDevices API supported\n');
      setResult(prev => prev + '✅ getUserMedia supported\n');

      // Test camera permission
      setResult(prev => prev + '📹 Requesting camera permission...\n');
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 640 },
          height: { ideal: 480 }
        } 
      });

      setResult(prev => prev + '✅ Camera permission granted!\n');
      setResult(prev => prev + `📹 Video tracks: ${stream.getVideoTracks().length}\n`);
      
      // Test microphone permission
      setResult(prev => prev + '🎤 Requesting microphone permission...\n');
      
      const audioStream = await navigator.mediaDevices.getUserMedia({ 
        audio: true 
      });

      setResult(prev => prev + '✅ Microphone permission granted!\n');
      setResult(prev => prev + `🎤 Audio tracks: ${audioStream.getAudioTracks().length}\n`);

      // Test both together
      setResult(prev => prev + '📹🎤 Testing both camera and microphone...\n');
      
      const bothStream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 640 },
          height: { ideal: 480 }
        },
        audio: true 
      });

      setResult(prev => prev + '✅ Both camera and microphone working!\n');
      setResult(prev => prev + `📹🎤 Total tracks: ${bothStream.getTracks().length}\n`);

      // Stop all streams
      stream.getTracks().forEach(track => track.stop());
      audioStream.getTracks().forEach(track => track.stop());
      bothStream.getTracks().forEach(track => track.stop());

      setResult(prev => prev + '🎉 All tests passed! Camera and microphone are working.\n');

    } catch (error) {
      setResult(prev => prev + `❌ Error: ${error.name}\n`);
      setResult(prev => prev + `❌ Message: ${error.message}\n`);
      
      if (error.name === 'NotAllowedError') {
        setResult(prev => prev + '💡 Solution: Allow camera and microphone permissions in your browser\n');
      } else if (error.name === 'NotFoundError') {
        setResult(prev => prev + '💡 Solution: Check if camera and microphone are connected\n');
      } else if (error.name === 'NotReadableError') {
        setResult(prev => prev + '💡 Solution: Close other apps using camera/microphone\n');
      } else if (error.name === 'NotSupportedError') {
        setResult(prev => prev + '💡 Solution: Use Chrome, Firefox, Safari, or Edge\n');
      } else {
        setResult(prev => prev + `💡 Solution: ${error.message}\n`);
      }
    }

    setIsLoading(false);
  };

  const clearResult = () => {
    setResult('');
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">📹 Simple Camera Test</h2>
      
      <div className="space-y-4">
        {/* Test Button */}
        <div className="bg-green-100 p-4 rounded-lg">
          <h3 className="font-semibold mb-2">🧪 Test Camera & Microphone</h3>
          <p className="text-sm mb-4">This is a simple test that will show you exactly what's happening with your camera and microphone permissions.</p>
          <div className="flex space-x-2">
            <button
              onClick={testCamera}
              disabled={isLoading}
              className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-400"
            >
              {isLoading ? 'Testing...' : '📹 Test Camera & Microphone'}
            </button>
            <button
              onClick={clearResult}
              className="px-4 py-2 bg-gray-500 text-white rounded"
            >
              🗑️ Clear
            </button>
          </div>
        </div>

        {/* Results */}
        {result && (
          <div className="bg-gray-100 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">📊 Test Results</h3>
            <pre className="text-sm whitespace-pre-wrap bg-white p-3 rounded border">
              {result}
            </pre>
          </div>
        )}

        {/* Instructions */}
        <div className="bg-blue-100 p-4 rounded-lg">
          <h3 className="font-semibold mb-2">📋 Instructions</h3>
          <ol className="list-decimal list-inside space-y-1 text-sm">
            <li>Click "Test Camera & Microphone" button</li>
            <li>Allow camera permission when prompted</li>
            <li>Allow microphone permission when prompted</li>
            <li>Check the results to see what's working</li>
            <li>If there's an error, follow the suggested solution</li>
          </ol>
        </div>

        {/* Troubleshooting */}
        <div className="bg-yellow-100 p-4 rounded-lg">
          <h3 className="font-semibold mb-2">🔧 Troubleshooting</h3>
          <div className="text-sm space-y-2">
            <p><strong>If you see "NotAllowedError":</strong></p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li>Click the camera/microphone icon in your browser's address bar</li>
              <li>Select "Allow" for both camera and microphone</li>
              <li>Refresh the page and try again</li>
            </ul>
            
            <p><strong>If you see "NotFoundError":</strong></p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li>Check if your camera and microphone are connected</li>
              <li>Try a different browser</li>
              <li>Check device settings</li>
            </ul>
            
            <p><strong>If you see "NotReadableError":</strong></p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li>Close other apps using camera/microphone (Zoom, Teams, etc.)</li>
              <li>Restart your browser</li>
              <li>Check if other browser tabs are using camera</li>
            </ul>
          </div>
        </div>

        {/* Quick Links */}
        <div className="bg-purple-100 p-4 rounded-lg">
          <h3 className="font-semibold mb-2">🔗 Quick Links</h3>
          <div className="text-sm space-y-1">
            <p>• <a href="/permission-error-debug" className="text-blue-600 underline">Permission Error Debug</a> - Detailed error analysis</p>
            <p>• <a href="/permission-request" className="text-blue-600 underline">Permission Request</a> - Request permissions</p>
            <p>• <a href="/no-permission-call-test" className="text-blue-600 underline">No Permission Call Test</a> - Test without camera</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimpleCameraTest;
