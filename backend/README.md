# AI Restaurant Assistant - Backend

A comprehensive NestJS backend for handling voice calls, chat interactions, and conversation management for restaurant AI assistants.

## 🚀 Features

- **Voice Integration**: Twilio Voice API for handling phone calls
- **Chat System**: Real-time WebSocket chat with Socket.io
- **AI Processing**: OpenAI GPT-4 and Whisper integration
- **Database**: Supabase PostgreSQL for data persistence
- **Health Monitoring**: Built-in health check endpoints
- **Security**: Helmet, CORS, and validation middleware

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account
- Twilio account
- OpenAI API key

## 🛠 Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   cp env.example .env
   ```
   
   Fill in your actual values in `.env`:
   ```env
   # Database
   SUPABASE_URL=your_supabase_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   
   # Twilio
   TWILIO_ACCOUNT_SID=your_twilio_sid
   TWILIO_AUTH_TOKEN=your_twilio_token
   
   # OpenAI
   OPENAI_API_KEY=your_openai_key
   ```

3. **Set up the database:**
   - Create a new Supabase project
   - Run the SQL schema from `../database/schema.sql`
   - Update your `.env` with Supabase credentials

## 🏃‍♂️ Running the Application

### Development
```bash
npm run start:dev
```

### Production
```bash
npm run build
npm run start:prod
```

## 📡 API Endpoints

### Health Check
- `GET /health` - Overall health status
- `GET /health/ready` - Readiness check

### Conversations
- `POST /conversations` - Create new conversation
- `GET /conversations` - List conversations
- `GET /conversations/:sessionId` - Get conversation by session
- `POST /conversations/:id/messages` - Add message to conversation

### Twilio Webhooks
- `POST /twilio/voice/incoming` - Handle incoming calls
- `POST /twilio/voice/process` - Process voice recordings

### WebSocket Events
- `chat_message` - Send chat message
- `join_session` - Join conversation session
- `get_chat_history` - Get conversation history

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `PORT` | Server port | No (default: 3001) |
| `NODE_ENV` | Environment | No (default: development) |
| `FRONTEND_URL` | Frontend URL for CORS | No (default: http://localhost:3000) |
| `SUPABASE_URL` | Supabase project URL | Yes |
| `SUPABASE_ANON_KEY` | Supabase anonymous key | Yes |
| `TWILIO_ACCOUNT_SID` | Twilio account SID | Yes |
| `TWILIO_AUTH_TOKEN` | Twilio auth token | Yes |
| `OPENAI_API_KEY` | OpenAI API key | Yes |

## 🏗 Architecture

```
src/
├── app.module.ts          # Main application module
├── main.ts               # Application bootstrap
├── conversations/        # Conversation management
├── chat/                 # WebSocket chat gateway
├── twilio/              # Voice call handling
├── openai/              # AI service integration
├── database/            # Database service
└── health/              # Health monitoring
```

## 🔍 Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## 📝 Logging

The application uses NestJS built-in logger with different log levels:
- `LOG_LEVEL=error` - Only errors
- `LOG_LEVEL=warn` - Warnings and errors
- `LOG_LEVEL=info` - Info, warnings, and errors (default)
- `LOG_LEVEL=debug` - All logs

## 🚨 Error Handling

- Global exception filters
- Validation pipes for request validation
- Structured error responses
- Health check monitoring

## 🔒 Security

- Helmet for security headers
- CORS configuration
- Input validation and sanitization
- Rate limiting (configurable)

## 📊 Monitoring

- Health check endpoints for monitoring
- Service status indicators
- Response time tracking
- Error logging and reporting

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.
