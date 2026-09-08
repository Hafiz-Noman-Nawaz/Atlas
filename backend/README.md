# Shield Funding AI Assistant — Backend API

Clean, scalable, enterprise-structured Node.js + Express + MongoDB REST API backend for the Shield Funding AI Assistant.

---

## Architecture Overview

```
backend/
├── config/
│   ├── db.js                 # Mongoose connection with event listeners
│   └── env.js                # Environment variables loader
│
├── controllers/
│   ├── authController.js     # User registration, login, profile (/api/auth)
│   ├── conversationController.js # CRUD for consultations (/api/conversations)
│   └── messageController.js  # Message persistence & AI responses (/api/conversations/:id/messages)
│
├── middleware/
│   ├── authMiddleware.js     # JWT verification
│   ├── errorMiddleware.js    # 404 handler & centralized error handling
│   └── rateLimiter.js        # API & Auth rate limiters
│
├── models/
│   ├── User.js               # Name, email, hashed password, timestamps
│   ├── Conversation.js       # User reference, title, timestamps
│   └── Message.js            # Conversation reference, role, content, timestamps
│
├── routes/
│   ├── index.js              # Aggregated router & /api/health endpoint
│   ├── authRoutes.js         # /api/auth routes
│   ├── conversationRoutes.js # /api/conversations routes
│   └── messageRoutes.js      # /api/conversations/:id/messages routes
│
├── services/
│   ├── llm/
│   │   ├── mockLlmService.js           # Domain-specific Shield Funding mock engine
│   │   └── llmService.placeholder.js   # Phase 2 Gemini/LLM integration placeholder
│   ├── rag/
│   │   └── ragService.placeholder.js   # Phase 2 Vector retrieval placeholder
│   └── memory/
│       └── memoryService.placeholder.js # Phase 2 Conversation buffer placeholder
│
├── utils/
│   ├── apiResponse.js        # Standardized { success, data, message } response formatting
│   └── token.js              # JWT sign & verify helpers
│
├── app.js                    # Express application setup, security middlewares, routes
├── server.js                 # Server entrypoint with DB connection
├── test_api.js               # Automated verification test suite
├── package.json
└── .env.example
```

---

## API Endpoints

### Health Check
- `GET /api/health` — Checks API status & MongoDB connection state.

### Authentication
- `POST /api/auth/register` — Register a new user (`name`, `email`, `password`).
- `POST /api/auth/login` — Authenticate and receive JWT token.
- `GET /api/auth/me` — Retrieve current authenticated user profile (`Authorization: Bearer <token>`).

### Conversations
- `GET /api/conversations` — List all conversations for the authenticated user.
- `POST /api/conversations` — Create a new consultation (`title`).
- `GET /api/conversations/:id` — Retrieve specific conversation details.
- `DELETE /api/conversations/:id` — Delete conversation and all its messages.

### Messages & AI Consultation
- `GET /api/conversations/:id/messages` — Retrieve all messages in a conversation.
- `POST /api/conversations/:id/messages` — Post user message, persist to MongoDB, and automatically trigger domain-specific AI response.

---

## Running Locally

1. **Install Dependencies**:
   ```bash
   cd backend
   npm install
   ```

2. **Configure Environment**:
   Copy `.env.example` to `.env` and set your MongoDB URI and JWT secret.
   ```bash
   cp .env.example .env
   ```

3. **Start Development Server**:
   ```bash
   npm run dev
   ```

4. **Run Verification Test Suite**:
   ```bash
   node test_api.js
   ```
