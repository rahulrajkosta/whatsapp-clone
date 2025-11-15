import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { SocketProvider } from './contexts/SocketContext';
import { CallProvider } from './contexts/CallContext';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import ChatList from './components/chat/ChatList';
import ChatWindow from './components/chat/ChatWindow';
import CallScreen from './components/call/CallScreen';
import TestConnection from './components/TestConnection';
import TestCall from './components/TestCall';
import MobileTest from './components/MobileTest';
import CallDebug from './components/CallDebug';
import CallFlowTest from './components/CallFlowTest';
import CallNavigationHandler from './components/CallNavigationHandler';
import PermissionTest from './components/PermissionTest';
import MobileCameraTest from './components/MobileCameraTest';
import MobileDiagnostic from './components/MobileDiagnostic';
import SimpleCallTest from './components/SimpleCallTest';
import PermissionRequest from './components/PermissionRequest';
import SimplePermissionTest from './components/SimplePermissionTest';
import NoPermissionCallTest from './components/NoPermissionCallTest';
import BrowserCompatibilityTest from './components/BrowserCompatibilityTest';
import PermissionErrorDebug from './components/PermissionErrorDebug';
import SimpleCameraTest from './components/SimpleCameraTest';
import CallOverlay from './components/call/CallOverlay';
import './App.css';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-whatsapp-green"></div>
      </div>
    );
  }
  
  return user ? children : <Navigate to="/login" />;
};

// Public Route Component (redirect if already logged in)
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-whatsapp-green"></div>
      </div>
    );
  }
  
  return user ? <Navigate to="/chats" /> : children;
};

function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <CallProvider>
          <Router>
          <div className="App">
            <Routes>
              <Route 
                path="/login" 
                element={
                  <PublicRoute>
                    <Login />
                  </PublicRoute>
                } 
              />
              <Route 
                path="/register" 
                element={
                  <PublicRoute>
                    <Register />
                  </PublicRoute>
                } 
              />
              <Route 
                path="/chats" 
                element={
                  <ProtectedRoute>
                    <ChatList />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/chat/:chatId" 
                element={
                  <ProtectedRoute>
                    <ChatWindow />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/call/:callId" 
                element={
                  <ProtectedRoute>
                    <CallScreen />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/test-call" 
                element={
                  <ProtectedRoute>
                    <TestCall />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/mobile-test" 
                element={<MobileTest />} 
              />
              <Route 
                path="/call-debug" 
                element={
                  <ProtectedRoute>
                    <CallDebug />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/call-flow-test" 
                element={
                  <ProtectedRoute>
                    <CallFlowTest />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/permission-test" 
                element={<PermissionTest />} 
              />
              <Route 
                path="/mobile-camera-test" 
                element={<MobileCameraTest />} 
              />
              <Route 
                path="/mobile-diagnostic" 
                element={<MobileDiagnostic />} 
              />
              <Route 
                path="/simple-call-test" 
                element={
                  <ProtectedRoute>
                    <SimpleCallTest />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/permission-request" 
                element={<PermissionRequest />} 
              />
              <Route 
                path="/simple-permission-test" 
                element={<SimplePermissionTest />} 
              />
              <Route 
                path="/no-permission-call-test" 
                element={
                  <ProtectedRoute>
                    <NoPermissionCallTest />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/browser-compatibility-test" 
                element={<BrowserCompatibilityTest />} 
              />
              <Route 
                path="/permission-error-debug" 
                element={<PermissionErrorDebug />} 
              />
              <Route 
                path="/simple-camera-test" 
                element={<SimpleCameraTest />} 
              />
              <Route path="/" element={<Navigate to="/chats" />} />
            </Routes>
            {/* Development test component - remove in production */}
            {process.env.NODE_ENV === 'development' && <TestConnection />}
            {/* Call navigation handler */}
            <CallNavigationHandler />
            {/* Call overlay for notifications */}
            <CallOverlay />
          </div>
          </Router>
        </CallProvider>
      </SocketProvider>
    </AuthProvider>
  );
}

export default App;
