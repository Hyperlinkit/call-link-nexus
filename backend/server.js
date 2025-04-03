
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const twilio = require('twilio');
const VoiceResponse = require('twilio').twiml.VoiceResponse;

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors({
  origin: process.env.ALLOWED_ORIGIN || 'http://localhost:8080'
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Twilio Configuration
const twilioAccountSid = process.env.TWILIO_ACCOUNT_SID;
const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN;
const twilioApiKey = process.env.TWILIO_API_KEY;
const twilioApiSecret = process.env.TWILIO_API_SECRET;
const twilioClient = twilio(twilioAccountSid, twilioAuthToken);
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

// Validate Twilio configuration
if (!twilioAccountSid || !twilioAuthToken || !twilioApiKey || !twilioApiSecret) {
  console.error('Missing Twilio configuration');
  process.exit(1);
}

// Generate access token for Twilio Client
app.post('/api/token', (req, res) => {
  const { identity = 'user' } = req.body;
  const AccessToken = twilio.jwt.AccessToken;
  const VoiceGrant = AccessToken.VoiceGrant;

  // Create a Voice grant for this token
  const voiceGrant = new VoiceGrant({
    outgoingApplicationSid: process.env.TWILIO_TWIML_APP_SID,
    incomingAllow: true,
  });

  // Create an access token
  const token = new AccessToken(
    twilioAccountSid,
    twilioApiKey,
    twilioApiSecret,
    { identity: identity }
  );
  
  // Add the voice grant to the token
  token.addGrant(voiceGrant);
  
  // Serialize the token as a JWT
  const jwtToken = token.toJwt();
  
  // Send the token
  res.json({ token: jwtToken });
});

// Handle incoming voice calls
app.post('/api/voice', (req, res) => {
  const twiml = new VoiceResponse();
  const dial = twiml.dial();
  
  // Direct the call to the client
  const { To, From } = req.body;
  
  if (To) {
    // Outgoing call: user is making a call from the browser
    if (To.startsWith('client:')) {
      // Call to another client
      dial.client(To.split(':')[1]);
    } else {
      // Call to a phone number
      dial.number({
        callerId: twilioPhoneNumber
      }, To);
    }
  } else {
    // Incoming call: route to the client
    dial.client('user');
  }
  
  res.set('Content-Type', 'text/xml');
  res.send(twiml.toString());
});

// Make outbound call (alternative API for placing calls through Twilio API directly)
app.post('/api/call', async (req, res) => {
  const { to } = req.body;
  
  if (!to) {
    return res.status(400).json({ error: 'Phone number is required' });
  }
  
  try {
    // Make the call using Twilio API
    const call = await twilioClient.calls.create({
      to: to,
      from: twilioPhoneNumber,
      url: `${req.protocol}://${req.get('host')}/api/voice`,
    });
    
    res.json({ success: true, callSid: call.sid });
  } catch (error) {
    console.error('Error making call:', error);
    res.status(500).json({ 
      error: 'Failed to place call', 
      details: error.message 
    });
  }
});

// Get call status
app.get('/api/call/:callSid', async (req, res) => {
  const { callSid } = req.params;
  
  try {
    const call = await twilioClient.calls(callSid).fetch();
    res.json({
      status: call.status,
      direction: call.direction,
      duration: call.duration,
      from: call.from,
      to: call.to
    });
  } catch (error) {
    console.error('Error fetching call:', error);
    res.status(500).json({ error: 'Failed to fetch call status' });
  }
});

// Get recent calls
app.get('/api/calls', async (req, res) => {
  try {
    const calls = await twilioClient.calls.list({
      limit: 20
    });
    
    const formattedCalls = calls.map(call => ({
      sid: call.sid,
      to: call.to,
      from: call.from,
      status: call.status,
      direction: call.direction,
      duration: call.duration,
      dateCreated: call.dateCreated
    }));
    
    res.json(formattedCalls);
  } catch (error) {
    console.error('Error fetching calls:', error);
    res.status(500).json({ error: 'Failed to fetch calls' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
