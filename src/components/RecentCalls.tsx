
import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  PhoneIncoming, 
  PhoneOutgoing, 
  PhoneMissed, 
  Phone,
  Clock
} from 'lucide-react';

export interface CallRecord {
  id: string;
  phoneNumber: string;
  name?: string;
  timestamp: Date;
  direction: 'incoming' | 'outgoing';
  status: 'answered' | 'missed' | 'rejected';
  duration?: number; // in seconds
}

interface RecentCallsProps {
  calls: CallRecord[];
  onCallClick: (phoneNumber: string) => void;
}

const RecentCalls: React.FC<RecentCallsProps> = ({ calls, onCallClick }) => {
  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
    }).format(date);
  };

  const formatDuration = (seconds: number = 0) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 
      ? `${mins}m ${secs}s`
      : `${secs}s`;
  };

  const getCallIcon = (direction: string, status: string) => {
    if (direction === 'incoming' && status === 'missed') {
      return <PhoneMissed size={16} className="text-cti-red" />;
    } else if (direction === 'incoming') {
      return <PhoneIncoming size={16} className="text-cti-green" />;
    } else {
      return <PhoneOutgoing size={16} className="text-cti-blue" />;
    }
  };

  return (
    <div className="mt-8">
      <div className="flex items-center mb-4">
        <Clock size={16} className="mr-2 text-muted-foreground" />
        <h2 className="text-lg font-semibold">Recent Calls</h2>
      </div>
      
      {calls.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          No recent calls
        </div>
      ) : (
        <div className="space-y-2">
          {calls.map(call => (
            <div 
              key={call.id}
              className="flex items-center justify-between p-3 rounded-lg border hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center">
                <div className="mr-3">
                  {getCallIcon(call.direction, call.status)}
                </div>
                <div>
                  <div className="font-medium">
                    {call.name || call.phoneNumber}
                  </div>
                  <div className="text-sm text-muted-foreground flex items-center">
                    <span>{formatTime(call.timestamp)}</span>
                    {call.status !== 'missed' && call.duration !== undefined && (
                      <>
                        <span className="mx-1">•</span>
                        <span>{formatDuration(call.duration)}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onCallClick(call.phoneNumber)}
                className="text-cti-blue hover:text-cti-blue hover:bg-cti-lightBlue"
              >
                <Phone size={16} />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RecentCalls;
