import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCall } from '../contexts/CallContext';

const CallNavigationHandler = () => {
  const { activeCall, callStatus } = useCall();
  const navigate = useNavigate();

  useEffect(() => {
    if (activeCall && callStatus === 'connected') {
      console.log('Navigating to call screen:', activeCall);
      navigate(`/call/${activeCall.id}?type=${activeCall.callType}`);
    }
  }, [activeCall, callStatus, navigate]);

  return null; // This component doesn't render anything
};

export default CallNavigationHandler;
