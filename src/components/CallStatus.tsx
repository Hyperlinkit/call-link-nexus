
import React from 'react';
import { cn } from '@/lib/utils';

interface CallStatusProps {
  status: string;
  direction: 'incoming' | 'outgoing' | null;
  phoneNumber: string;
  name?: string;
  duration?: number; // in seconds
}

const CallStatus: React.FC<CallStatusProps> = ({
  status,
  direction,
  phoneNumber,
  name,
  duration = 0
}) => {
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatusText = () => {
    switch (status) {
      case 'ringing':
        return direction === 'incoming' ? 'Incoming Call' : 'Calling...';
      case 'dialing':
        return 'Dialing...';
      case 'in-progress':
        return formatDuration(duration);
      case 'error':
        return 'Call Failed';
      default:
        return '';
    }
  };

  const isCallActive = ['ringing', 'dialing', 'in-progress'].includes(status);

  return (
    <div className={cn(
      "text-center py-6 transition-all duration-300",
      isCallActive ? "opacity-100 max-h-48" : "opacity-0 max-h-0 overflow-hidden"
    )}>
      {isCallActive && (
        <>
          <div className="flex justify-center mb-2">
            <div className="relative">
              <div className="w-20 h-20 bg-cti-blue/10 rounded-full flex items-center justify-center">
                <div className="text-2xl font-bold text-cti-blue">
                  {(name || phoneNumber || '?').charAt(0).toUpperCase()}
                </div>
              </div>
              {status === 'ringing' && (
                <div className="absolute inset-0 rounded-full bg-cti-blue/20 animate-pulse-ring"></div>
              )}
            </div>
          </div>
          
          <h3 className="text-xl font-semibold mb-1">
            {name || phoneNumber || 'Unknown Caller'}
          </h3>
          
          <p className="text-sm text-muted-foreground">
            {getStatusText()}
          </p>
        </>
      )}
    </div>
  );
};

export default CallStatus;
