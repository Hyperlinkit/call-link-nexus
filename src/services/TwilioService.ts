// This is a client-side service for interacting with Twilio
import { Device, Connection } from '@twilio/voice-sdk';

interface TwilioServiceState {
  device: Device | null;
  connection: Connection | null;
  isReady: boolean;
  isOnCall: boolean;
  isMuted: boolean;
  callStatus: string;
  callDirection: 'incoming' | 'outgoing' | null;
  callerInfo: {
    phoneNumber: string;
    name: string;
  } | null;
}

class TwilioService {
  state: TwilioServiceState;
  onStateChangeCallbacks: ((state: TwilioServiceState) => void)[];
  backendUrl: string;

  constructor() {
    this.state = {
      device: null,
      connection: null,
      isReady: false,
      isOnCall: false,
      isMuted: false,
      callStatus: 'idle',
      callDirection: null,
      callerInfo: null,
    };
    this.onStateChangeCallbacks = [];
    
    // Default to localhost for development or use current hostname for production
    const isProduction = import.meta.env.PROD;
    const host = isProduction ? window.location.hostname : 'localhost';
    const port = isProduction ? window.location.port : '4000';
    const protocol = isProduction ? window.location.protocol : 'http:';
    
    this.backendUrl = `${protocol}//${host}${port ? ':' + port : ''}`;
  }

  // Fetch Twilio token from our backend
  async fetchToken(): Promise<string> {
    try {
      const response = await fetch(`${this.backendUrl}/api/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ identity: 'user' }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch token');
      }
      
      const data = await response.json();
      return data.token;
    } catch (error) {
      console.error('Error fetching token:', error);
      throw error;
    }
  }

  // This method would be called to initialize Twilio with a token from the backend
  async setup() {
    try {
      // Get token from backend
      const token = await this.fetchToken();
      
      // Create a new Device instance
      const device = new Device(token);
      
      // Set up event listeners
      device.on('registered', () => {
        this.updateState({
          isReady: true,
          callStatus: 'ready'
        });
        console.log('Twilio device registered and ready');
      });

      device.on('error', (error) => {
        console.error('Twilio device error:', error);
        this.updateState({
          callStatus: 'error'
        });
      });

      device.on('incoming', (connection) => {
        this.updateState({
          connection,
          isOnCall: true,
          callStatus: 'ringing',
          callDirection: 'incoming',
          callerInfo: {
            phoneNumber: connection.parameters.From || 'Unknown',
            name: 'Unknown Caller' // You'd typically look this up in your system
          }
        });
        
        // Set up connection listeners
        this.setupConnectionListeners(connection);
      });

      // Register the device to receive incoming calls
      await device.register();

      this.updateState({
        device
      });

    } catch (error) {
      console.error('Error setting up Twilio device:', error);
    }
  }

  private setupConnectionListeners(connection: Connection) {
    connection.on('accept', () => {
      this.updateState({
        callStatus: 'in-progress'
      });
    });

    connection.on('disconnect', () => {
      this.updateState({
        isOnCall: false,
        callStatus: 'idle',
        callDirection: null,
        callerInfo: null,
        connection: null
      });
    });

    connection.on('reject', () => {
      this.updateState({
        isOnCall: false,
        callStatus: 'idle',
        callDirection: null,
        callerInfo: null,
        connection: null
      });
    });
  }

  async makeCall(phoneNumber: string) {
    try {
      if (!this.state.device || !this.state.isReady) {
        throw new Error('Twilio device not ready');
      }

      // Make call through the device
      const connection = await this.state.device.connect({
        params: {
          To: phoneNumber
        }
      });

      this.setupConnectionListeners(connection);
      
      this.updateState({
        connection,
        isOnCall: true,
        callStatus: 'dialing',
        callDirection: 'outgoing',
        callerInfo: {
          phoneNumber,
          name: 'Dialing...' // You'd typically look this up in your system
        }
      });

    } catch (error) {
      console.error('Error making call:', error);
      this.updateState({
        callStatus: 'error'
      });
    }
  }

  answerCall() {
    if (this.state.connection) {
      this.state.connection.accept();
      this.updateState({
        callStatus: 'in-progress'
      });
    }
  }

  rejectCall() {
    if (this.state.connection) {
      this.state.connection.reject();
      this.updateState({
        isOnCall: false,
        callStatus: 'idle',
        callDirection: null,
        callerInfo: null,
        connection: null
      });
    }
  }

  hangupCall() {
    if (this.state.connection) {
      this.state.connection.disconnect();
      this.updateState({
        isOnCall: false,
        callStatus: 'idle',
        callDirection: null,
        callerInfo: null,
        connection: null
      });
    }
  }

  toggleMute() {
    if (this.state.connection) {
      if (this.state.isMuted) {
        this.state.connection.mute(false);
      } else {
        this.state.connection.mute(true);
      }
      this.updateState({
        isMuted: !this.state.isMuted
      });
    }
  }

  sendDTMF(digit: string) {
    if (this.state.connection && this.state.isOnCall) {
      this.state.connection.sendDigits(digit);
    }
  }

  async fetchRecentCalls() {
    try {
      const response = await fetch(`${this.backendUrl}/api/calls`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch calls');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching calls:', error);
      throw error;
    }
  }

  onStateChange(callback: (state: TwilioServiceState) => void) {
    this.onStateChangeCallbacks.push(callback);
    // Immediately invoke with current state
    callback({ ...this.state });
    return () => {
      this.onStateChangeCallbacks = this.onStateChangeCallbacks.filter(cb => cb !== callback);
    };
  }

  private updateState(partialState: Partial<TwilioServiceState>) {
    this.state = { ...this.state, ...partialState };
    this.notifyStateChange();
  }

  private notifyStateChange() {
    this.onStateChangeCallbacks.forEach(callback => {
      callback({ ...this.state });
    });
  }
}

// Singleton instance
const twilioService = new TwilioService();
export default twilioService;
