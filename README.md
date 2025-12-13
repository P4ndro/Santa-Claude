# Santa Claude 🎅

An AI-powered mock interview platform that helps candidates prepare for job interviews and produces explainable interview reports.

## Vision

Santa Claude is a productivity tool designed to:
- **For Candidates**: Practice realistic job interviews and receive constructive feedback
- **For Companies** (future): Pre-screen applicants before human interviews

Current focus: **Candidate-side MVP**

---

## Core User Flow

```
Landing Page → Register/Login → Home → Start Interview → Interview Room → Report → Home
                                                ↑                              ↓
                                                └──── View Past Reports ←──────┘
```

1. User lands on the site
2. User registers or logs in (JWT auth)
3. User is redirected to Home
4. User starts a mock interview
5. User enters Interview Room
6. User answers questions (text input)
7. Interview completes
8. User sees a Report
9. User returns to Home and can revisit past reports

---

## What is an "Interview"?

An interview is a stored session consisting of:

| Component | Description |
|-----------|-------------|
| Questions | Predefined set of questions with types and weights |
| Answers | User responses stored as text transcripts |
| Evaluation | Analysis of answer quality |
| Report | Final feedback with actionable insights |

**Interview Types:**
- **Practice interviews** — Private, for self-improvement
- **Application interviews** — (Future) Shared with companies

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React + Vite + Tailwind CSS |
| Backend | Node.js + Express |
| Database | MongoDB + Mongoose |
| Auth | JWT (access + refresh tokens) |
| AI | Provider-agnostic abstraction layer |

---

## Project Structure

```
/
├── client/                 # React frontend
│   └── src/
│       ├── pages/          # Landing, Auth, Home, Interview, Report, Profile
│       ├── api.js          # API client
│       └── authContext.jsx # Auth state
│
├── server/                 # Express backend
│   ├── ai/                 # AI abstraction layer
│   ├── models/             # User, Interview models
│   ├── routes/             # API routes
│   └── middleware/         # Auth, error handling
│
└── docs/                   # Documentation
    └── api-contract.md     # API specification
```

---

## Quick Start

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)

### Install

```bash
npm install
npm run install:all
```

### Configure Environment

Create `server/.env`:
```env
MONGODB_URL=your-mongodb-connection-string
JWT_ACCESS_SECRET=your-access-secret
JWT_REFRESH_SECRET=your-refresh-secret
CLIENT_ORIGIN=http://localhost:5173
PORT=3000
USE_MOCK_AI=true
```

Create `client/.env`:
```env
VITE_API_BASE_URL=http://localhost:3000/api
```

### Run

```bash
npm run dev    # Runs both server (:3000) and client (:5173)
```

Open http://localhost:5173

---

## Interview Evaluation Philosophy

### Weighted Scoring
- **Technical/coding questions** → Higher weight
- **Behavioral questions** → Lower weight

### Report Language
The AI acts as a **coach**, not a hiring authority:

✅ "What held your readiness back..."  
❌ "You failed..." or "Rejected"

### Primary Blockers
Reports identify specific questions that most negatively affected readiness, with constructive guidance.

---

## AI Integration

The project includes an AI abstraction layer with **no vendor lock-in**:

```
server/ai/llmClient.js
```

### Features
- No hardcoded AI provider
- Mock mode via `USE_MOCK_AI=true`
- Easy to swap: OpenAI, Claude, Gemini, etc.

### AI Use Cases (planned)
- Question generation
- Answer evaluation
- Report generation

For MVP, AI returns deterministic mock responses.

---

## Architecture Principles

| Principle | Implementation |
|-----------|----------------|
| Backend owns logic | All business logic lives in the API |
| Frontend is dumb | React only renders UI and calls endpoints |
| Stateless backend | No server-side sessions (except DB) |
| REST API | No GraphQL, no real-time features |
| Minimal components | Avoid over-splitting React components |

---

## Database Models

### Users
```javascript
{
  email: String,
  passwordHash: String,
  createdAt: Date
}
```

### Interviews (planned)
```javascript
{
  userId: ObjectId,
  status: 'in_progress' | 'completed',
  questions: [{
    id: String,
    text: String,
    type: 'technical' | 'behavioral',
    weight: Number
  }],
  answers: [{
    questionId: String,
    transcript: String
  }],
  evaluation: Object,
  report: Object,
  createdAt: Date,
  completedAt: Date
}
```

---

## MVP Success Criteria

- [x] User can register/login
- [ ] User can start an interview
- [ ] User can answer multiple questions
- [ ] User can see a stored report
- [ ] User can return to Home and revisit past reports
- [ ] All data persists after page refresh

---

## API Documentation

See [docs/api-contract.md](docs/api-contract.md) for full API specification.

### Current Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register |
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/logout` | Logout |
| POST | `/api/auth/refresh` | Refresh token |
| GET | `/api/auth/me` | Get current user |
| GET | `/api/health` | Health check |

### Planned Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/interviews` | Start new interview |
| GET | `/api/interviews` | List user's interviews |
| GET | `/api/interviews/:id` | Get interview details |
| POST | `/api/interviews/:id/answer` | Submit answer |
| POST | `/api/interviews/:id/complete` | Complete interview |
| GET | `/api/interviews/:id/report` | Get report |

---

## Development Stage

| Phase | Status |
|-------|--------|
| Auth scaffold | ✅ Complete |
| Frontend pages (UI-only) | ✅ Complete |
| API contract | ✅ Complete |
| Interview endpoints | 🔄 Next |
| Mock evaluation | 🔄 Next |
| AI integration | ⏳ Later |
| Company features | ⏳ Later |

