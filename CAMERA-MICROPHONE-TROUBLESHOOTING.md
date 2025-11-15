# Camera & Microphone Permission Troubleshooting Guide

## 🚨 Common Issues and Solutions

### 1. **"Failed to access camera/microphone" Error**

This error occurs when the browser blocks access to your camera and microphone. Here's how to fix it:

#### **Desktop Browsers:**

**Chrome/Edge:**
1. Look for a camera icon in the address bar (left side)
2. Click on it and select "Allow" for both camera and microphone
3. Refresh the page
4. If still blocked, go to `chrome://settings/content/camera` and allow the site

**Firefox:**
1. Look for a camera icon in the address bar
2. Click "Allow" when prompted
3. Or go to `about:preferences#privacy` → Permissions → Camera/Microphone

**Safari:**
1. Go to Safari → Preferences → Websites
2. Select Camera and Microphone
3. Set your site to "Allow"

#### **Mobile Browsers:**

**Android Chrome:**
1. Tap the lock icon in the address bar
2. Select "Permissions"
3. Enable Camera and Microphone
4. Refresh the page

**iOS Safari:**
1. Go to Settings → Safari → Camera/Microphone
2. Allow access
3. Or tap the "aA" icon in Safari → Website Settings

### 2. **HTTPS Requirement**

**Problem:** Camera/microphone access requires HTTPS on most browsers.

**Solution:**
- Use `https://` instead of `http://`
- For local development, use `https://localhost:3000`
- For mobile testing, use your computer's IP with HTTPS

### 3. **Browser Compatibility**

**Supported Browsers:**
- ✅ Chrome 53+
- ✅ Firefox 36+
- ✅ Safari 11+
- ✅ Edge 12+
- ❌ Internet Explorer (not supported)

**Mobile Support:**
- ✅ Chrome Mobile
- ✅ Safari Mobile (iOS 11+)
- ✅ Samsung Internet
- ❌ Some older mobile browsers

### 4. **Device Issues**

**No Camera/Microphone Found:**
1. Check if devices are connected
2. Check if other apps are using them
3. Restart the browser
4. Check device drivers (Windows)

**Permission Denied:**
1. Check system privacy settings
2. Make sure no other app is using the camera
3. Try closing other video calling apps (Zoom, Teams, etc.)

### 5. **Testing Your Permissions**

Use our permission test tool:
1. Go to `http://10.123.215.217:3000/permission-test`
2. Click "Test Permissions"
3. Follow the troubleshooting steps if any fail

### 6. **Step-by-Step Fix Process**

1. **Check Browser Permissions:**
   - Look for camera/microphone icons in address bar
   - Click and allow permissions

2. **Test with Permission Tool:**
   - Visit `/permission-test`
   - Run the test
   - Fix any issues found

3. **Try Different Browser:**
   - If one browser doesn't work, try another
   - Chrome usually has the best support

4. **Check HTTPS:**
   - Make sure you're using `https://` not `http://`
   - For local development, you might need to set up HTTPS

5. **Restart Everything:**
   - Close all browser tabs
   - Restart the browser
   - Try again

### 7. **Mobile-Specific Issues**

**iOS Safari:**
- Requires iOS 11 or later
- Must use HTTPS
- User must manually allow permissions

**Android Chrome:**
- Usually works well
- Check app permissions in Android settings
- Make sure Chrome has camera/microphone permissions

### 8. **Development Environment**

**For Local Development:**
```bash
# Start with HTTPS (if possible)
npm start -- --https

# Or use ngrok for HTTPS tunneling
npx ngrok http 3000
```

**For Mobile Testing:**
- Use your computer's IP address
- Make sure both devices are on the same network
- Consider using ngrok for HTTPS

### 9. **Error Messages and Solutions**

| Error Message | Solution |
|---------------|----------|
| `NotAllowedError` | Allow permissions in browser |
| `NotFoundError` | Check if camera/microphone is connected |
| `NotSupportedError` | Use a different browser |
| `NotReadableError` | Close other apps using camera/microphone |
| `AbortError` | Try again, might be temporary |

### 10. **Quick Test Commands**

**Test in Browser Console:**
```javascript
// Test if getUserMedia is supported
navigator.mediaDevices.getUserMedia({video: true, audio: true})
  .then(stream => {
    console.log('Permissions work!');
    stream.getTracks().forEach(track => track.stop());
  })
  .catch(error => {
    console.log('Permission error:', error.name, error.message);
  });
```

## 🎯 **Quick Fix Checklist**

- [ ] Check browser address bar for camera/microphone icons
- [ ] Click "Allow" when prompted
- [ ] Refresh the page
- [ ] Try a different browser
- [ ] Check if using HTTPS
- [ ] Close other video calling apps
- [ ] Test with `/permission-test` page
- [ ] Check mobile browser permissions
- [ ] Restart browser if needed

## 📱 **Mobile Testing URLs**

- **Permission Test**: `http://10.123.215.217:3000/permission-test`
- **Call Flow Test**: `http://10.123.215.217:3000/call-flow-test`
- **Main App**: `http://10.123.215.217:3000`

## 🔧 **Still Having Issues?**

1. **Check the browser console** for detailed error messages
2. **Use the permission test tool** to diagnose the exact issue
3. **Try different browsers** to see if it's browser-specific
4. **Check system privacy settings** (especially on Mac/Windows)
5. **Make sure no other apps** are using the camera/microphone

The permission test tool at `/permission-test` will give you detailed information about what's working and what's not!
