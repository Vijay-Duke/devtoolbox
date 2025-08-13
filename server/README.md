# Temporary Email Server

A Hono.js-powered server providing Server-Sent Events (SSE) for real-time temporary email functionality.

## Features

- **Real-time Email Streaming**: SSE-based live email updates
- **Temporary Inbox Generation**: Creates random disposable email addresses
- **Email Simulation**: Generate mock emails for testing
- **OTP Detection**: Automatically extracts OTP codes from email content
- **Inbox Management**: Create, monitor, and cleanup temporary inboxes
- **CORS Support**: Pre-configured for DevToolbox frontend

## Quick Start

```bash
# Install dependencies
npm install

# Start development server (with hot reload)
npm run dev

# Start production server
npm start
```

The server will start on `http://localhost:3001`

## API Endpoints

### Generate Inbox
```http
GET /api/inbox/generate
```

Creates a new temporary inbox with a random email address.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid-v4",
    "email": "random123@temp-mail.dev",
    "createdAt": "2025-01-13T08:15:00Z"
  }
}
```

### Stream Emails (SSE)
```http
GET /api/emails/:inboxId/stream
```

Server-Sent Events endpoint for real-time email streaming.

**Events:**
- `email`: New email received
- `ping`: Keepalive heartbeat (every 30s)

### Simulate Email
```http
POST /api/emails/:inboxId
Content-Type: application/json

{
  "auto": true
}
```

Generates and delivers a mock email with random OTP code.

**Custom Email:**
```json
{
  "from": "test@example.com",
  "subject": "Custom Email",
  "body": "Your verification code is: 123456"
}
```

### Delete Inbox
```http
DELETE /api/inbox/:inboxId
```

Immediately cleanup inbox and close all connections.

### Health Check
```http
GET /health
```

Returns server status and statistics.

## Configuration

- **Port**: Set via `PORT` environment variable (default: 3001)
- **Cleanup**: Inboxes auto-expire after 2 hours
- **Connection Management**: Automatic cleanup of stale SSE connections

## Mock Email Generation

The server generates realistic mock emails from common services:
- GitHub notifications
- Google security alerts  
- Stripe notifications
- AWS alerts
- Vercel/Netlify updates

Each mock email includes:
- Realistic sender addresses
- Varied subject lines
- OTP codes (4-8 digits)
- Contextual email body content

## Integration with DevToolbox

1. Start this server: `npm run dev`
2. Open DevToolbox frontend
3. Navigate to "Temporary Email" tool
4. Generate inbox and receive real-time emails

## Development Notes

- Uses Hono.js for lightweight, fast API
- SSE implementation with connection management
- In-memory storage (suitable for temporary data)
- CORS pre-configured for `localhost:8081`
- Automatic cleanup prevents memory leaks
- Hot reload enabled in development mode

## Production Deployment

For production use:

1. Set appropriate PORT environment variable
2. Configure CORS origins for your domain
3. Consider implementing persistent storage if needed
4. Add rate limiting and authentication as required
5. Monitor memory usage for long-running instances