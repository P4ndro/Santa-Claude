# MERN Authentication Scaffold

A full-stack MERN (MongoDB, Express, React, Node.js) scaffold with JWT authentication and a provider-agnostic AI interface layer.

## Features

- **Authentication**: Email/password with JWT (access + refresh tokens)
- **Secure Cookies**: Refresh tokens stored in HttpOnly cookies
- **React Frontend**: Vite + React Router + Tailwind CSS
- **AI Ready**: Provider-agnostic LLM interface layer
- **No Vendor Lock-in**: Safe to push to GitHub, no proprietary dependencies

## Project Structure

```
/client          # React frontend (Vite)
  /src
    /pages       # AuthPage, Dashboard
    App.jsx      # Routing + auth guards
    api.js       # API client with token refresh
    authContext.jsx  # Auth state management
/server          # Node.js + Express backend
  /ai            # AI interface layer
    llmClient.js # Provider-agnostic LLM client
  /config        # Database configuration
  /middleware    # Auth middleware, error handler
  /models        # Mongoose models
  /routes        # API routes
  index.js       # Server entry point
```

## Quick Start

### Prerequisites

- Node.js 18+
- MongoDB (local or MongoDB Atlas)

### 1. Clone & Install

```bash
# Install all dependencies (root + server + client)
npm install
npm run install:all
```

### 2. Configure Environment Variables

Copy `server/ENV_EXAMPLE.txt` to `server/.env`:

```env
# MongoDB connection string
MONGODB_URI=mongodb://localhost:27017/mern-auth

# JWT secrets (use strong random strings in production!)
JWT_ACCESS_SECRET=your-access-token-secret-change-this
JWT_REFRESH_SECRET=your-refresh-token-secret-change-this

# Frontend origin for CORS
CLIENT_ORIGIN=http://localhost:5173

# Server port
PORT=3000

# Node environment
NODE_ENV=development
```

Copy `client/ENV_EXAMPLE.txt` to `client/.env`:

```env
VITE_API_BASE_URL=http://localhost:3000/api
```

### 3. Start Development Servers

```bash
# Run both server and client with one command
npm run dev
```

Or run separately in two terminals:
```bash
npm run server   # Backend on :3000
npm run client   # Frontend on :5173
```

The app will be available at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:3000

## API Endpoints

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login user |
| POST | `/api/auth/logout` | Logout user |
| POST | `/api/auth/refresh` | Refresh access token |
| GET | `/api/auth/me` | Get current user (protected) |

### Protected

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/protected` | Test protected route |

### Health

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Server health check |

## Authentication Flow

### Token Strategy

1. **Access Token** (15 min expiry)
   - Returned in JSON response
   - Stored in memory (not localStorage)
   - Sent via `Authorization: Bearer <token>` header

2. **Refresh Token** (7 day expiry)
   - Stored in HttpOnly cookie
   - Automatically sent with requests
   - Used to obtain new access tokens

### Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│  LOGIN/REGISTER                                              │
│  POST /api/auth/login                                        │
│  ↓                                                           │
│  Response: { accessToken, user }                             │
│  + Set-Cookie: refreshToken (HttpOnly)                       │
└─────────────────────────────────────────────────────────────┘
         ↓
┌─────────────────────────────────────────────────────────────┐
│  PROTECTED REQUESTS                                          │
│  Authorization: Bearer <accessToken>                         │
│  ↓                                                           │
│  If 401 → Try POST /api/auth/refresh → Retry request         │
└─────────────────────────────────────────────────────────────┘
         ↓
┌─────────────────────────────────────────────────────────────┐
│  PAGE LOAD / REFRESH                                         │
│  POST /api/auth/refresh (cookie sent automatically)          │
│  ↓                                                           │
│  Response: { accessToken, user }                             │
│  (Session restored!)                                         │
└─────────────────────────────────────────────────────────────┘
```

## AI Layer (llmClient.js)

The AI layer is designed to be provider-agnostic. It includes a placeholder that can be replaced with any LLM provider.

### Location

```
server/ai/llmClient.js
```

### Usage

```javascript
import { callLLM, isLLMConfigured, getLLMStatus } from './ai/llmClient.js';

// Check if configured
if (isLLMConfigured()) {
  const response = await callLLM('Your prompt here');
}
```

### Adding a Provider

1. Install the provider SDK:

```bash
# OpenAI
npm install openai

# Anthropic Claude
npm install @anthropic-ai/sdk

# Google Gemini
npm install @google/generative-ai
```

2. Set environment variables:

```env
LLM_PROVIDER=openai
LLM_API_KEY=your-api-key
```

3. Implement the provider in `llmClient.js` (see file for examples)

### Example Implementations

**OpenAI:**
```javascript
import OpenAI from 'openai';
const openai = new OpenAI({ apiKey: process.env.LLM_API_KEY });

export async function callLLM(prompt) {
  const response = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [{ role: 'user', content: prompt }],
  });
  return response.choices[0].message.content;
}
```

**Anthropic Claude:**
```javascript
import Anthropic from '@anthropic-ai/sdk';
const anthropic = new Anthropic({ apiKey: process.env.LLM_API_KEY });

export async function callLLM(prompt) {
  const message = await anthropic.messages.create({
    model: 'claude-3-opus-20240229',
    max_tokens: 1024,
    messages: [{ role: 'user', content: prompt }],
  });
  return message.content[0].text;
}
```

## Security Notes

- Access tokens are stored in memory (cleared on page refresh)
- Refresh tokens use HttpOnly cookies (not accessible to JavaScript)
- CORS is configured for specific frontend origin only
- Passwords are hashed with bcrypt (12 rounds)
- Helmet.js adds security headers

## Production Deployment

1. Generate strong secrets for JWT:
   ```bash
   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
   ```

2. Update environment variables:
   - Set `NODE_ENV=production`
   - Use strong JWT secrets
   - Configure CORS for production domain

3. Build the client:
   ```bash
   cd client
   npm run build
   ```

## License

MIT

