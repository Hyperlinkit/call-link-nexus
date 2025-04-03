
# Twilio CTI Backend

This is the backend server for the Twilio CTI (Computer Telephony Integration) application. It handles Twilio authentication, token generation, and call management.

## Setup Instructions

1. **Install dependencies**

```bash
cd backend
npm install
```

2. **Configure environment variables**

Copy the `.env.example` file to `.env` and fill in your Twilio credentials:

```bash
cp .env.example .env
```

Then edit the `.env` file with your Twilio credentials:

- `TWILIO_ACCOUNT_SID`: Your Twilio Account SID
- `TWILIO_AUTH_TOKEN`: Your Twilio Auth Token
- `TWILIO_API_KEY`: Your Twilio API Key
- `TWILIO_API_SECRET`: Your Twilio API Secret
- `TWILIO_TWIML_APP_SID`: Your TwiML App SID
- `TWILIO_PHONE_NUMBER`: Your Twilio phone number

3. **Start the server**

```bash
npm start
```

For development with auto-reload:

```bash
npm run dev
```

## Twilio Setup

1. Create a Twilio account at https://www.twilio.com
2. Purchase a phone number
3. Create a TwiML App in the Twilio console
4. Configure the Voice URL for your TwiML App to point to `https://your-server.com/api/voice`
5. Create API credentials in the Twilio console
6. Copy all credentials to your `.env` file

## API Endpoints

- `POST /api/token`: Generate a Twilio access token for client-side usage
- `POST /api/voice`: TwiML endpoint for handling incoming and outgoing calls
- `POST /api/call`: Initiate an outbound call via the Twilio API
- `GET /api/call/:callSid`: Get status of a specific call
- `GET /api/calls`: Get a list of recent calls
