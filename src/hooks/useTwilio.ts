
import { useState, useEffect } from 'react';
import twilioService from '../services/TwilioService';

interface RecentCall {
  sid: string;
  to: string;
  from: string;
  status: string;
  direction: string;
  duration: string;
  dateCreated: string;
}

export function useTwilio() {
  const [twilioState, setTwilioState] = useState(twilioService.state);
  const [recentCalls, setRecentCalls] = useState<RecentCall[]>([]);
  const [isLoadingCalls, setIsLoadingCalls] = useState(false);

  useEffect(() => {
    const unsubscribe = twilioService.onStateChange(setTwilioState);
    return unsubscribe;
  }, []);

  // Initialize Twilio on component mount
  useEffect(() => {
    const initializeTwilio = async () => {
      try {
        await twilioService.setup();
      } catch (error) {
        console.error('Failed to initialize Twilio:', error);
      }
    };
    
    initializeTwilio();
  }, []);

  const makeCall = (phoneNumber: string) => {
    twilioService.makeCall(phoneNumber);
  };

  const answerCall = () => {
    twilioService.answerCall();
  };

  const rejectCall = () => {
    twilioService.rejectCall();
  };

  const hangupCall = () => {
    twilioService.hangupCall();
  };

  const toggleMute = () => {
    twilioService.toggleMute();
  };

  const sendDTMF = (digit: string) => {
    twilioService.sendDTMF(digit);
  };

  const loadRecentCalls = async () => {
    setIsLoadingCalls(true);
    try {
      const calls = await twilioService.fetchRecentCalls();
      setRecentCalls(calls);
    } catch (error) {
      console.error('Error loading calls:', error);
    } finally {
      setIsLoadingCalls(false);
    }
  };

  return {
    ...twilioState,
    makeCall,
    answerCall,
    rejectCall,
    hangupCall,
    toggleMute,
    sendDTMF,
    recentCalls,
    isLoadingCalls,
    loadRecentCalls
  };
}
