// Browser detection utility
export const detectBrowser = () => {
  const userAgent = navigator.userAgent;
  const browserInfo = {
    name: 'Unknown',
    version: 'Unknown',
    isSupported: false,
    recommendations: []
  };

  // Chrome detection
  if (userAgent.includes('Chrome') && !userAgent.includes('Edge') && !userAgent.includes('OPR')) {
    browserInfo.name = 'Chrome';
    const match = userAgent.match(/Chrome\/(\d+)/);
    if (match) {
      browserInfo.version = match[1];
      browserInfo.isSupported = parseInt(match[1]) >= 53;
    }
  }
  // Firefox detection
  else if (userAgent.includes('Firefox')) {
    browserInfo.name = 'Firefox';
    const match = userAgent.match(/Firefox\/(\d+)/);
    if (match) {
      browserInfo.version = match[1];
      browserInfo.isSupported = parseInt(match[1]) >= 36;
    }
  }
  // Safari detection
  else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
    browserInfo.name = 'Safari';
    const match = userAgent.match(/Version\/(\d+)/);
    if (match) {
      browserInfo.version = match[1];
      browserInfo.isSupported = parseInt(match[1]) >= 11;
    }
  }
  // Edge detection
  else if (userAgent.includes('Edge')) {
    browserInfo.name = 'Edge';
    const match = userAgent.match(/Edge\/(\d+)/);
    if (match) {
      browserInfo.version = match[1];
      browserInfo.isSupported = parseInt(match[1]) >= 12;
    }
  }
  // Internet Explorer detection
  else if (userAgent.includes('Trident') || userAgent.includes('MSIE')) {
    browserInfo.name = 'Internet Explorer';
    browserInfo.isSupported = false;
    browserInfo.recommendations.push('Internet Explorer is not supported. Please use Chrome, Firefox, Safari, or Edge.');
  }

  // Add recommendations based on browser
  if (!browserInfo.isSupported) {
    if (browserInfo.name === 'Internet Explorer') {
      browserInfo.recommendations.push('Please upgrade to Chrome, Firefox, Safari, or Edge for video calling support.');
    } else {
      browserInfo.recommendations.push(`Please update ${browserInfo.name} to the latest version for video calling support.`);
    }
  }

  // Check for mobile
  const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
  browserInfo.isMobile = isMobile;

  // Mobile-specific recommendations
  if (isMobile) {
    if (browserInfo.name === 'Chrome') {
      browserInfo.recommendations.push('Chrome Mobile has excellent video calling support.');
    } else if (browserInfo.name === 'Safari') {
      browserInfo.recommendations.push('Safari Mobile supports video calling on iOS 11+.');
    } else {
      browserInfo.recommendations.push('For best mobile experience, use Chrome Mobile or Safari Mobile.');
    }
  }

  return browserInfo;
};

// Check if getUserMedia is supported
export const checkGetUserMediaSupport = () => {
  const support = {
    mediaDevices: !!navigator.mediaDevices,
    getUserMedia: !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia),
    isHTTPS: window.location.protocol === 'https:',
    isLocalhost: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  };

  support.isSecureContext = support.isHTTPS || support.isLocalhost;
  
  return support;
};

// Get browser recommendations
export const getBrowserRecommendations = () => {
  const browser = detectBrowser();
  const support = checkGetUserMediaSupport();
  const recommendations = [];

  if (!support.mediaDevices) {
    recommendations.push('Your browser does not support the MediaDevices API.');
    recommendations.push('Please use Chrome, Firefox, Safari, or Edge.');
  } else if (!support.getUserMedia) {
    recommendations.push('Your browser does not support getUserMedia.');
    recommendations.push('Please update your browser to the latest version.');
  }

  if (!support.isSecureContext) {
    recommendations.push('Camera and microphone access requires HTTPS.');
    recommendations.push('Please use https:// instead of http://');
  }

  if (!browser.isSupported) {
    recommendations.push(`${browser.name} ${browser.version} may not fully support video calling.`);
    recommendations.push('Please use Chrome, Firefox, Safari, or Edge for the best experience.');
  }

  return {
    browser,
    support,
    recommendations
  };
};
