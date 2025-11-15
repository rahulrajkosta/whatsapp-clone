# 📞 Call Testing Guide

## 🚨 Call Issues Between Mobile and Computer

If you're unable to receive calls from mobile or initiate calls from mobile, follow this guide:

### ✅ **Step 1: Start All Servers**

```bash
start-whatsapp-complete.bat
```

### ✅ **Step 2: Test Call Debug Console**

1. **Open computer browser**: `http://localhost:3000/call-debug`
2. **Open mobile browser**: `http://10.123.215.217:3000/call-debug`
3. **Check connection status** on both devices
4. **Look for any error messages** in the debug console

### ✅ **Step 3: Test Call Flow**

#### **Test 1: Computer to Mobile**
1. **Computer**: Register user "ComputerUser"
2. **Mobile**: Register user "MobileUser"
3. **Computer**: Go to chats, find MobileUser
4. **Computer**: Click video/phone icon
5. **Mobile**: Should show incoming call notification
6. **Mobile**: Accept or reject the call

#### **Test 2: Mobile to Computer**
1. **Mobile**: Go to chats, find ComputerUser
2. **Mobile**: Click video/phone icon
3. **Computer**: Should show incoming call notification
4. **Computer**: Accept or reject the call

### ✅ **Step 4: Debug Common Issues**

#### **Issue 1: No Incoming Call Notifications**
**Symptoms**: Clicking call button doesn't show notification on other device

**Solutions**:
1. Check if both users are online (green dot in chat list)
2. Check debug console for Socket.IO events
3. Verify both devices are connected to same WiFi
4. Check if backend is receiving call events

#### **Issue 2: Call Notifications Not Showing**
**Symptoms**: Call is initiated but no popup appears

**Solutions**:
1. Check browser permissions for notifications
2. Check if CallOverlay component is rendering
3. Look for JavaScript errors in browser console
4. Verify Socket.IO connection is active

#### **Issue 3: Call Accepted But No Video/Audio**
**Symptoms**: Call connects but no media streams

**Solutions**:
1. Check camera/microphone permissions
2. Verify PeerJS server is running on port 3001
3. Check if both devices can access PeerJS server
4. Look for WebRTC connection errors

### ✅ **Step 5: Check Debug Information**

#### **On Computer**:
- Open `http://localhost:3000/call-debug`
- Check "Connection Status" section
- Look at "Call Events Log" for incoming events
- Check "Socket Events" for real-time communication

#### **On Mobile**:
- Open `http://10.123.215.217:3000/call-debug`
- Check same sections as computer
- Compare user IDs and connection status

### ✅ **Step 6: Manual Testing Steps**

1. **Register two users** (one on each device)
2. **Open debug console** on both devices
3. **Start a call** from one device
4. **Check debug logs** to see if events are being sent/received
5. **Accept the call** and check if media streams work

### 🔧 **Troubleshooting Commands**

#### **Check if servers are running**:
```bash
# Check backend
curl http://10.123.215.217:5000/api/auth

# Check PeerJS
curl http://10.123.215.217:3001

# Check frontend
curl http://10.123.215.217:3000
```

#### **Check network connectivity**:
```bash
# From mobile, ping computer
ping 10.123.215.217

# Check if ports are open
telnet 10.123.215.217 5000
telnet 10.123.215.217 3001
```

### 📱 **Mobile-Specific Issues**

#### **Browser Permissions**:
1. Allow camera and microphone access
2. Allow notifications
3. Use Chrome or Safari (not Firefox)
4. Try incognito mode if needed

#### **Network Issues**:
1. Ensure both devices on same WiFi
2. Check if mobile can access computer's IP
3. Disable mobile data (use only WiFi)
4. Try mobile hotspot if WiFi doesn't work

### 🎯 **Expected Debug Output**

#### **Successful Call Initiation**:
```
Initiating call: {callId: "call_1234567890_abc123", participantId: "user123", callType: "video", userId: "user456"}
EMIT initiate_call
RECEIVE incoming_call
```

#### **Successful Call Acceptance**:
```
EMIT accept_call
RECEIVE call_accepted
✅ Call accepted: {callId: "call_1234567890_abc123", participant: {...}}
```

### 🚀 **Quick Fixes**

1. **Restart all servers** if calls stop working
2. **Clear browser cache** on both devices
3. **Check Windows Firewall** settings
4. **Verify user IDs** are correct in debug console
5. **Test with same user** on both devices first

### 📞 **Test URLs**

- **Computer**: `http://localhost:3000`
- **Mobile**: `http://10.123.215.217:3000`
- **Call Debug**: `http://10.123.215.217:3000/call-debug`
- **Mobile Test**: `http://10.123.215.217:3000/mobile-test`

---

**If still having issues, check the debug console on both devices and look for error messages or missing events!** 🔍
