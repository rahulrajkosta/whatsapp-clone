# 📱 Mobile Troubleshooting Guide

## 🚨 Network Error on Mobile

If you're getting "Network Error" or "AxiosError: Network Error" on mobile, follow these steps:

### ✅ **Step 1: Test Mobile Connectivity**

1. **Open your phone's browser**
2. **Go to**: `http://10.123.215.217:3000/mobile-test`
3. **Click "Test Direct Connection"** button
4. **Check the results**

### ✅ **Step 2: Verify Backend is Running**

Make sure all servers are running:
```bash
# Run this on your computer:
start-whatsapp-complete.bat
```

### ✅ **Step 3: Check Network Configuration**

**Your computer's IP**: `10.123.215.217`

**URLs to test on mobile**:
- Frontend: `http://10.123.215.217:3000`
- Backend API: `http://10.123.215.217:5000/api/auth`
- Mobile Test: `http://10.123.215.217:3000/mobile-test`

### ✅ **Step 4: Common Fixes**

#### **Fix 1: Windows Firewall**
1. Open Windows Defender Firewall
2. Click "Allow an app or feature through Windows Defender Firewall"
3. Click "Change settings" → "Allow another app"
4. Add Node.js and allow it for both Private and Public networks

#### **Fix 2: Network Discovery**
1. Open Network and Sharing Center
2. Click "Change advanced sharing settings"
3. Turn on "Network discovery" and "File and printer sharing"

#### **Fix 3: Router Settings**
- Make sure both devices are on the same WiFi network
- Check if your router has client isolation enabled (disable it)

### ✅ **Step 5: Test Step by Step**

1. **Test Backend Directly**:
   - Open `http://10.123.215.217:5000/api/auth` on mobile
   - Should show: `{"msg":"No token, authorization denied"}`

2. **Test Frontend**:
   - Open `http://10.123.215.217:3000` on mobile
   - Should load the login page

3. **Test Mobile Test Page**:
   - Open `http://10.123.215.217:3000/mobile-test` on mobile
   - Click "Test Direct Connection"
   - Should show success message

### ✅ **Step 6: Alternative Solutions**

#### **Option A: Use Computer's Local IP**
If `10.123.215.217` doesn't work, find your computer's current IP:
```bash
# Run this on your computer:
ipconfig
```
Look for "IPv4 Address" under your WiFi adapter.

#### **Option B: Use ngrok (Advanced)**
1. Install ngrok: `npm install -g ngrok`
2. Run: `ngrok http 5000`
3. Use the ngrok URL for mobile access

### ✅ **Step 7: Debug Information**

**Check these on mobile**:
- WiFi network name (must match computer)
- IP address (should be in same range as 10.123.215.217)
- Browser (use Chrome or Safari)

**Check these on computer**:
- All servers running (backend, frontend, peerjs)
- Windows Firewall settings
- Network adapter settings

### 🎯 **Expected Results**

**✅ Success**: Mobile test page shows "Direct Connection Successful"
**❌ Failure**: Mobile test page shows "Direct Connection Failed"

### 📞 **Still Having Issues?**

1. **Try different browsers** on mobile
2. **Restart all servers** on computer
3. **Check if mobile can ping computer**: Use network scanner app
4. **Try hotspot**: Use phone's hotspot for computer's internet

### 🎉 **Success!**

Once mobile connectivity works:
1. **Register a user** on mobile
2. **Register another user** on computer
3. **Start chatting and calling** between devices!

---

**Quick Test URLs**:
- Mobile Test: `http://10.123.215.217:3000/mobile-test`
- Main App: `http://10.123.215.217:3000`
- Backend API: `http://10.123.215.217:5000/api/auth`
