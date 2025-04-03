
import React, { useState, useEffect } from 'react';
import { useTwilio } from '@/hooks/useTwilio';
import Dialer from './Dialer';
import CallControls from './CallControls';
import CallStatus from './CallStatus';
import RecentCalls, { CallRecord } from './RecentCalls';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { Phone, History, Settings, Info } from 'lucide-react';

const CTIApp: React.FC = () => {
  const twilioState = useTwilio();
  const { toast } = useToast();
  const [callDuration, setCallDuration] = useState(0);
  const [activeTab, setActiveTab] = useState('dialer');
  const [recentCalls, setRecentCalls] = useState<CallRecord[]>([]);
  const [tokenInput, setTokenInput] = useState('');
  
  // For demo purposes - In a real app, you'd get this from your backend
  const setupTwilio = async () => {
    try {
      if (!tokenInput) {
        toast({
          title: "Token Required",
          description: "Please enter your Twilio token to connect.",
          variant: "destructive"
        });
        return;
      }
      
      await twilioState.setupTwilio(tokenInput);
      toast({
        title: "Connected to Twilio",
        description: "Your device is now ready to make and receive calls.",
      });
    } catch (error) {
      console.error('Error setting up Twilio:', error);
      toast({
        title: "Connection Failed",
        description: "Could not connect to Twilio. Check your token and try again.",
        variant: "destructive"
      });
    }
  };

  // Update call timer when on an active call
  useEffect(() => {
    let timerId: number;
    
    if (twilioState.callStatus === 'in-progress') {
      setCallDuration(0);
      timerId = window.setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    } else {
      setCallDuration(0);
    }
    
    return () => {
      if (timerId) clearInterval(timerId);
    };
  }, [twilioState.callStatus]);

  // Store call in history when it ends
  useEffect(() => {
    const prevStatus = twilioState.callStatus;
    
    if (
      ['in-progress', 'ringing'].includes(prevStatus) && 
      twilioState.callStatus === 'idle' &&
      twilioState.callerInfo
    ) {
      // Call just ended, add to history
      const newCall: CallRecord = {
        id: Date.now().toString(),
        phoneNumber: twilioState.callerInfo.phoneNumber,
        name: twilioState.callerInfo.name !== 'Unknown Caller' ? twilioState.callerInfo.name : undefined,
        timestamp: new Date(),
        direction: twilioState.callDirection || 'outgoing',
        status: prevStatus === 'in-progress' ? 'answered' : 'missed',
        duration: prevStatus === 'in-progress' ? callDuration : undefined
      };
      
      setRecentCalls(prev => [newCall, ...prev].slice(0, 50)); // Keep last 50 calls
    }
  }, [twilioState.callStatus, twilioState.callerInfo, twilioState.callDirection, callDuration]);

  const handleMakeCall = (phoneNumber: string) => {
    if (twilioState.isReady) {
      twilioState.makeCall(phoneNumber);
      setActiveTab('dialer');
    } else {
      toast({
        title: "Device Not Ready",
        description: "Please set up your Twilio connection first.",
        variant: "destructive"
      });
    }
  };

  const handleDigit = (digit: string) => {
    if (twilioState.isOnCall) {
      twilioState.sendDTMF(digit);
    }
  };

  return (
    <div className="container max-w-lg py-6">
      <Card className="overflow-hidden shadow-md">
        <div className="p-4">
          <CallStatus 
            status={twilioState.callStatus}
            direction={twilioState.callDirection}
            phoneNumber={twilioState.callerInfo?.phoneNumber || ''}
            name={twilioState.callerInfo?.name}
            duration={callDuration}
          />
          
          <CallControls 
            status={twilioState.callStatus}
            isIncoming={twilioState.callDirection === 'incoming'}
            isMuted={twilioState.isMuted}
            onAnswer={twilioState.answerCall}
            onReject={twilioState.rejectCall}
            onHangup={twilioState.hangupCall}
            onToggleMute={twilioState.toggleMute}
          />
          
          <Tabs 
            value={activeTab} 
            onValueChange={setActiveTab}
            className="mt-4"
          >
            <TabsList className="grid grid-cols-3 w-full">
              <TabsTrigger value="dialer" className="flex items-center">
                <Phone size={16} className="mr-2" /> Dialer
              </TabsTrigger>
              <TabsTrigger value="history" className="flex items-center">
                <History size={16} className="mr-2" /> History
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center">
                <Settings size={16} className="mr-2" /> Setup
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="dialer">
              <Dialer 
                onCall={handleMakeCall} 
                onDigit={handleDigit}
                disabled={!twilioState.isReady || ['ringing', 'dialing'].includes(twilioState.callStatus)} 
              />
            </TabsContent>
            
            <TabsContent value="history">
              <RecentCalls calls={recentCalls} onCallClick={handleMakeCall} />
            </TabsContent>
            
            <TabsContent value="settings">
              <div className="space-y-4 p-2">
                <div>
                  <label className="text-sm font-medium mb-1 block">
                    Twilio Token
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={tokenInput}
                      onChange={(e) => setTokenInput(e.target.value)}
                      placeholder="Enter your Twilio token"
                      className="flex-1 p-2 border rounded-md"
                    />
                    <Button 
                      onClick={setupTwilio}
                      disabled={twilioState.isReady}
                    >
                      Connect
                    </Button>
                  </div>
                </div>
                
                <div className="text-sm text-muted-foreground border-t pt-4 mt-4">
                  <div className="flex items-start mb-2">
                    <Info size={16} className="mr-2 mt-0.5" />
                    <p>
                      This is a demo interface for Twilio integration. In a production app, you would:
                    </p>
                  </div>
                  <ul className="list-disc ml-6 space-y-1">
                    <li>Generate tokens securely from your backend</li>
                    <li>Store call history in a database</li>
                    <li>Implement user authentication</li>
                    <li>Add contact management features</li>
                  </ul>
                </div>
                
                <div className="flex items-center justify-between border-t pt-4">
                  <div>
                    <div className="text-sm font-medium">Device Status</div>
                    <div className="text-sm text-muted-foreground">
                      {twilioState.isReady ? 'Connected' : 'Not Connected'}
                    </div>
                  </div>
                  <div className={`h-3 w-3 rounded-full ${twilioState.isReady ? 'bg-cti-green' : 'bg-cti-red'}`}></div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </Card>
    </div>
  );
};

export default CTIApp;
