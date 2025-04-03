
import React from 'react';
import { Button } from '@/components/ui/button';
import { Phone, MicOff, Mic, PhoneOff } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CallControlsProps {
  status: string;
  isIncoming: boolean;
  isMuted: boolean;
  onAnswer: () => void;
  onReject: () => void;
  onHangup: () => void;
  onToggleMute: () => void;
}

const CallControls: React.FC<CallControlsProps> = ({
  status,
  isIncoming,
  isMuted,
  onAnswer,
  onReject,
  onHangup,
  onToggleMute
}) => {
  const isActive = status === 'in-progress';
  const isRinging = status === 'ringing';

  return (
    <div className={cn(
      "flex justify-center gap-8 py-4",
      (isRinging || isActive) ? "opacity-100" : "opacity-0 pointer-events-none",
      "transition-opacity duration-300"
    )}>
      {isRinging && isIncoming && (
        <>
          <Button
            onClick={onAnswer}
            className="bg-cti-green hover:bg-cti-green/90 text-white h-16 w-16 rounded-full"
          >
            <Phone size={24} />
          </Button>
          <Button
            onClick={onReject}
            className="bg-cti-red hover:bg-cti-red/90 text-white h-16 w-16 rounded-full"
          >
            <PhoneOff size={24} />
          </Button>
        </>
      )}
      
      {isActive && (
        <>
          <Button
            onClick={onToggleMute}
            className={cn(
              "h-16 w-16 rounded-full border-2",
              isMuted 
                ? "bg-cti-red/20 hover:bg-cti-red/30 border-cti-red text-cti-red" 
                : "bg-transparent hover:bg-gray-100 border-gray-300 text-gray-600"
            )}
          >
            {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
          </Button>
          <Button
            onClick={onHangup}
            className="bg-cti-red hover:bg-cti-red/90 text-white h-16 w-16 rounded-full"
          >
            <PhoneOff size={24} />
          </Button>
        </>
      )}
    </div>
  );
};

export default CallControls;
