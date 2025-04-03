
import { useState, useEffect } from 'react';
import twilioService from '../services/TwilioService';

export function useTwilio() {
  const [twilioState, setTwilioState] = useState(twilioService.state);

  useEffect(() => {
    const unsubscribe = twilioService.onStateChange(setTwilioState);
    return unsubscribe;
  }, []);

  const setupTwilio = async (token: string) => {
    await twilioService.setup(token);
  };

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

  return {
    ...twilioState,
    setupTwilio,
    makeCall,
    answerCall,
    rejectCall,
    hangupCall,
    toggleMute,
    sendDTMF
  };
}
