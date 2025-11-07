# KenTunez - Kenyan Music Platform

A comprehensive music platform for Kenyan artists to upload, manage, and distribute their music.

## Features

- Artist registration and authentication
- Music upload and management
- Analytics and revenue tracking
- Artist profile management
- **Phone verification system** - Real SMS verification for secure account creation

## Setup Instructions

### Prerequisites

- Node.js 18+
- Supabase account and project
- SMS Service Provider (optional for production)

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   ```
   Fill in your Supabase credentials and SMS service keys (see SMS Configuration below).

4. Run database migrations:
   ```bash
   # Apply the phone verification migration
   supabase db reset
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

## Phone Verification Setup

### Database Migration
The phone verification system requires a database migration that creates:
- `sms_verification_codes` table for tracking verification attempts
- Database functions for creating and verifying SMS codes
- RLS policies for security
- Phone verification tracking in user profiles

### SMS Service Configuration

For production SMS sending, configure one of these providers in your `.env` file:

#### Option 1: Twilio (Recommended - Global)
```env
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=your_twilio_number
```

#### Option 2: Africa's Talking (Recommended - Africa)
```env
AFRICASTALKING_API_KEY=your_api_key
AFRICASTALKING_USERNAME=your_username
```

### Supabase Edge Function Deployment

Deploy the SMS sending edge function:

```bash
supabase functions deploy send-sms --project-ref your-project-ref
```

Set the required environment variables in Supabase Dashboard:
- `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER` (for Twilio)
- `AFRICASTALKING_API_KEY`, `AFRICASTALKING_USERNAME` (for Africa's Talking)

### Development Mode

In development, the system works without real SMS:
- Database functions still track verification attempts
- Console logs show what SMS would be sent
- Use verification code `123456` for testing
- All security and rate limiting features are active

## Phone Verification Flow

1. **Request Code**: User enters phone number and clicks "Send Verification Code"
2. **Database Tracking**: System creates verification record in database
3. **SMS Sending**: Edge function sends real SMS (or logs in development)
4. **Code Entry**: User enters 6-digit code received via SMS
5. **Verification**: System validates code and marks phone as verified
6. **Security Features**:
   - 10-minute expiration time
   - 3 verification attempts per code
   - Rate limiting (3 SMS requests per hour)
   - Automatic cleanup of expired codes

## Phone Number Validation

The system includes Kenyan phone number validation:
- Accepts formats: `0712345678`, `+254712345678`, `712345678`
- Automatically formats to E.164 standard (`+254712345678`)
- Validates against Kenyan mobile network prefixes

## Security Features

- Row Level Security (RLS) policies protect all SMS verification data
- Rate limiting prevents SMS spam
- Verification codes expire after 10 minutes
- Maximum 3 attempts per verification code
- Phone numbers are validated and formatted before storage

## Testing

### Development Testing
- Use any valid Kenyan phone number format
- Enter verification code `123456` when prompted
- Check browser console for SMS simulation logs

### Production Testing
- Use real phone numbers
- Receive actual SMS messages
- Verify with codes received via SMS

## Troubleshooting

### Common Issues

1. **"No verification code received"**
   - Check SMS service configuration
   - Verify phone number format
   - Check Supabase Edge Function logs

2. **"Rate limit exceeded"**
   - Wait 1 hour before requesting new codes
   - System allows max 3 SMS requests per hour per user

3. **"Code expired"**
   - Verification codes expire in 10 minutes
   - Request a new code if expired

4. **"Max attempts exceeded"**
   - Each verification code allows 3 attempts
   - Request a new code after 3 failed attempts

### Debug Mode

Enable debug logging by setting:
```bash
export NODE_ENV=development
```

This will show detailed logs in the browser console during phone verification.

## Architecture

### Frontend Components
- `VerificationStep.jsx` - Main verification UI component
- `smsVerificationService.js` - Service layer for SMS operations

### Backend Components
- Database migration with verification tables and functions
- Supabase Edge Function for SMS sending
- RLS policies for data security

### SMS Integration
- Modular SMS provider support (Twilio, Africa's Talking, AWS SNS)
- Fallback to development mode when no provider configured
- Edge function handles all SMS operations securely

## Contributing

1. Fork the repository
2. Create a feature branch
3. Test phone verification with development mode
4. Submit a pull request

## License

MIT License - see LICENSE file for details