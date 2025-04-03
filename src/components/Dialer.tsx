
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Phone, X, Plus, Hash } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DialerProps {
  onCall: (phoneNumber: string) => void;
  onDigit?: (digit: string) => void;
  disabled?: boolean;
}

const Dialer: React.FC<DialerProps> = ({ onCall, onDigit, disabled = false }) => {
  const [phoneNumber, setPhoneNumber] = useState('');

  const handleDigitClick = (digit: string) => {
    setPhoneNumber(prev => prev + digit);
    if (onDigit) onDigit(digit);
  };

  const handleBackspace = () => {
    setPhoneNumber(prev => prev.slice(0, -1));
  };

  const handleCallClick = () => {
    if (phoneNumber.length > 0) {
      onCall(phoneNumber);
    }
  };

  const handleClearClick = () => {
    setPhoneNumber('');
  };

  const DialerButton = ({ digit, letters, className }: { digit: string, letters?: string, className?: string }) => (
    <Button
      onClick={() => handleDigitClick(digit)}
      disabled={disabled}
      variant="ghost"
      size="lg"
      className={cn("h-16 w-16 rounded-full flex flex-col items-center justify-center text-lg font-semibold", className)}
    >
      {digit}
      {letters && <span className="text-xs text-muted-foreground">{letters}</span>}
    </Button>
  );

  return (
    <div className="flex flex-col items-center max-w-sm mx-auto">
      <div className="relative w-full mb-6">
        <input
          type="text"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value.replace(/[^0-9+*#]/g, ''))}
          className="w-full p-4 text-2xl text-center font-semibold rounded-md border focus:ring-2 focus:ring-cti-blue"
          placeholder="Enter phone number"
          readOnly={disabled}
        />
        {phoneNumber.length > 0 && (
          <button 
            onClick={handleClearClick}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            disabled={disabled}
          >
            <X size={20} />
          </button>
        )}
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <DialerButton digit="1" />
        <DialerButton digit="2" letters="ABC" />
        <DialerButton digit="3" letters="DEF" />
        <DialerButton digit="4" letters="GHI" />
        <DialerButton digit="5" letters="JKL" />
        <DialerButton digit="6" letters="MNO" />
        <DialerButton digit="7" letters="PQRS" />
        <DialerButton digit="8" letters="TUV" />
        <DialerButton digit="9" letters="WXYZ" />
        <DialerButton digit="*" />
        <DialerButton digit="0" letters="+" />
        <DialerButton digit="#" />
      </div>

      <Button
        onClick={handleCallClick}
        disabled={disabled || phoneNumber.length === 0}
        className="bg-cti-green hover:bg-cti-green/90 text-white h-16 w-16 rounded-full"
      >
        <Phone size={24} />
      </Button>
    </div>
  );
};

export default Dialer;
