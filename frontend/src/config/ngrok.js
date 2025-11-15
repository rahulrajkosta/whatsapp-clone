// Ngrok configuration for HTTPS
const getNgrokConfig = () => {
  // Check if we're running on ngrok
  const isNgrok = window.location.hostname.includes('ngrok');
  const isHTTPS = window.location.protocol === 'https:';
  
  if (isNgrok && isHTTPS) {
    // Extract the ngrok domain
    const ngrokDomain = window.location.hostname;
    
    return {
      API_URL: `https://${ngrokDomain}/api`,
      SERVER_URL: `https://${ngrokDomain}`,
      PEER_SERVER_URL: `https://${ngrokDomain}:3001`,
      isNgrok: true,
      isHTTPS: true
    };
  } else {
    // Local development
    return {
      API_URL: 'http://10.123.215.217:5000/api',
      SERVER_URL: 'http://10.123.215.217:5000',
      PEER_SERVER_URL: 'http://10.123.215.217:3001',
      isNgrok: false,
      isHTTPS: false
    };
  }
};

export default getNgrokConfig;
