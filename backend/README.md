# Atlas Backend (Node.js + Express)

Production-ready Node.js + Express backend for the **Atlas Chatbot** application.

---

## Architecture Overview

```
React Frontend (Vite)
        │
        ▼ (REST API / JWT)
Node.js + Express Backend
        │
        ├── Mongoose Models (User, Conversation, Message, Feedback)
        ├── Controllers & Middleware (JWT Auth, Error Handling, Validation)
        └── Chatbot Engine
                ├── Mock Mode (Built-in High-Performance JS Keyword/Topic Engine)
                └── Real Mode (Optional External Python / ML Microservice)
```

---

## Getting Started

### 1. Prerequisites
- **Node.js**: v18+ (tested with v24)
- **MongoDB**: Local MongoDB instance or free cloud [MongoDB Atlas](https://www.mongodb.com/atlas) URI

### 2. Installation
```bash
cd backend
npm install
```

### 3. Environment Variables
Copy `.env.example` to `.env` and adjust if needed:
```env
PORT=8000
MONGODB_URI=mongodb://127.0.0.1:27017/atlas_db
JWT_SECRET=atlas_super_secret_jwt_key_2026
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
CHATBOT_MODE=mock
ML_SERVICE_URL=http://127.0.0.1:5000/predict
```

### 4. Running the Backend
- **Development Mode (with auto-reload):**
  ```bash
  npm run dev
  ```
- **Production Mode:**
  ```bash
  npm start
  ```

---

## API Endpoints

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/health` | Health check | No |
| `POST` | `/api/auth/register` | Register new user | No |
| `POST` | `/api/auth/login` | Login user & get JWT | No |
| `GET` | `/api/auth/me` | Get current user profile | Yes |
| `GET` | `/api/conversations` | List user's conversations | Yes |
| `POST` | `/api/conversations` | Create a new conversation | Yes |
| `GET` | `/api/conversations/:id` | Get single conversation | Yes |
| `PATCH` | `/api/conversations/:id` | Rename conversation | Yes |
| `DELETE` | `/api/conversations/:id` | Delete conversation (cascades) | Yes |
| `POST` | `/api/chat` | Send message & get bot reply | Yes |
| `GET` | `/api/conversations/:id/messages` | Get paginated messages | Yes |
| `POST` | `/api/messages/:id/feedback` | Submit thumbs up/down rating | Yes |

---

## Chatbot Modes

### 1. Mock Mode (`CHATBOT_MODE=mock`)
Runs the built-in JavaScript keyword matching and response pool engine. Zero external dependencies, instant response time.

### 2. Real ML Mode (`CHATBOT_MODE=real`)
Forwards user messages to an external ML inference service configured by `ML_SERVICE_URL`. Expects `{ message: string, intent?: string, confidence?: number }` in response.
