# ⚡ ZeoAtlas — Autonomous AI Engineering & Conversational Platform

<div align="center">

[![Production Status](https://img.shields.io/badge/Status-Live%20in%20Production-0ea5e9?style=for-the-badge&logo=vercel)](https://www.zeoatlas.tech)
[![ML Accuracy](https://img.shields.io/badge/ML%20Accuracy-100%25%20(36%20Intents)-10b981?style=for-the-badge&logo=scikitlearn)](https://www.zeoatlas.tech)
[![Node Backend](https://img.shields.io/badge/Backend-Node.js%20%7C%20Express-339933?style=for-the-badge&logo=nodedotjs)](https://nodejs.org)
[![React Frontend](https://img.shields.io/badge/Frontend-React%2018%20%7C%20Vite-61dafb?style=for-the-badge&logo=react)](https://react.dev)
[![Database](https://img.shields.io/badge/Database-MongoDB%20Atlas-47a248?style=for-the-badge&logo=mongodb)](https://www.mongodb.com/atlas)
[![License](https://img.shields.io/badge/License-MIT-amber?style=for-the-badge)](LICENSE)

**ZeoAtlas** is a production-grade, full-stack conversational AI platform specialized in software engineering, technical reasoning, real-time web search grounding, and interactive code execution.

[🌐 Live Website (zeoatlas.tech)](https://www.zeoatlas.tech) • [📖 Architecture & Case Study](#-system-architecture--engineering-case-study) • [🚀 Quickstart](#-getting-started-locally) • [📡 API Reference](#-api-endpoints)

</div>

---

## 📌 Table of Contents
1. [Executive Summary](#-executive-summary)
2. [Key Features & Capabilities](#-key-features--capabilities)
3. [System Architecture & Engineering Case Study](#-system-architecture--engineering-case-study)
4. [Machine Learning Pipeline & Dataset Engineering](#-machine-learning-pipeline--dataset-engineering)
5. [Complete Tech Stack & Tools](#-complete-tech-stack--tools)
6. [Project Structure](#-project-structure)
7. [API Endpoints](#-api-endpoints)
8. [Environment Configuration](#-environment-configuration)
9. [Getting Started Locally](#-getting-started-locally)
10. [Engineering Challenges & Key Solutions](#-engineering-challenges--key-solutions)
11. [Author & Acknowledgments](#-author--acknowledgments)

---

## 🌟 Executive Summary

**ZeoAtlas** bridges the gap between lightweight, zero-latency local Natural Language Understanding (NLU) and high-reasoning Generative AI Large Language Models (LLMs).

Unlike conventional chatbots that blindly route all user queries directly to expensive cloud LLM APIs, ZeoAtlas employs a **two-tier hybrid intelligence architecture**:
1. **Tier 1 (Instant Local Classification)**: A regularized, hybrid n-gram Scikit-Learn machine learning model (29,275 samples across 36 intents, 100% test accuracy) predicts user intent and confidence in sub-millisecond time via a persistent Node.js ↔ Python IPC worker.
2. **Tier 2 (Context-Aware Generative Streaming)**: Technical inquiries, complex coding tasks, summarizations, and live search queries are streamed directly from Google Gemini with conversation history, persistent memories, attached document context, and Google Search Grounding.

---

## 🚀 Key Features & Capabilities

### 1. 🧠 High-Accuracy ML Intent Routing (36 Intents)
- Custom machine learning model trained on **29,275 samples across 36 domain intents** (Python, JavaScript, Git & DevOps, System Design, SQL/Databases, Summarization, Capabilities, User Profile, etc.).
- Probability calibration via `CalibratedClassifierCV` ensures high-confidence routing and eliminates false positives.

### 2. 🌐 Live Web Search Grounding
- Interactive **`🌐 Web Search`** toggle in the message composer.
- Directly invokes Google Gemini Search Grounding tools (`tools: [{ googleSearch: {} }]`) to pull real-time 2026 facts, verified documentation, software release notes, and cited sources.

### 3. 💻 Side-by-Side Code Canvas & In-Browser Sandbox
- **Live Execution Sandbox**: Run HTML, CSS, JavaScript, and React snippets inside an isolated, secure `iframe`.
- **In-Browser Console Output**: Real-time logging of `console.log()` outputs and runtime exceptions.
- **Code Editor & Exporter**: Tabbed syntax view with 1-click downloads (`.html`, `.js`, `.py`, `.ts`, `.json`).
- **In-Chat Triggers**: Every code block in chat includes instant **"▶ Run"** and **"⛶ Canvas"** buttons.

### 4. 🔊 Neural Text-to-Speech (TTS) Voice Readout
- Natural neural voice synthesis powered by Web Speech API.
- Markdown cleanup engine strips code blocks and syntax markers for crystal-clear auditory playback.
- Animated sound wave visualizers in message actions with instant pause/stop controls.

### 5. 🔗 Shareable Public Chat Snapshots (`/share/:shareId`)
- Generate public, anonymized read-only links for any conversation.
- Share directly to **𝕏 / Twitter**, **LinkedIn**, and **WhatsApp**.
- Dedicated standalone public view page (`SharedChatPage.tsx`) accessible to teammates without authentication.

### 6. 📄 Multimodal Document Understanding (RAG)
- Upload files up to 20MB (**PDF, DOCX, CSV, TXT, Markdown, Python, JavaScript, JSON**).
- Automated server-side text extraction parses documents and injects content directly into the conversation context window.

### 7. 🧠 Long-Term Memory & User Profile Persistence
- Explicit memory triggers: *"Remember that my favorite stack is MERN"* saves preferences permanently to the database.
- Recall commands: *"What do you remember about me?"* lists all saved user context and notes across sessions.

### 8. 📱 Installable Progressive Web App (PWA)
- Full PWA manifest (`manifest.json`) and service worker (`sw.js`) with network-first caching.
- Installable on desktop (Chrome, Edge, macOS) and mobile devices (iOS, Android) as a native application with offline resilience.

### 9. ⚡ Extreme Performance & Code Splitting
- Optimized initial JavaScript entry bundle from `784 kB` down to **`27.8 kB` (~96% reduction)**.
- Dynamic route and modal code-splitting via `React.lazy` and `Suspense`.
- Custom `React.memo` comparators on message bubbles eliminate re-render lag during real-time token streaming.

---

## 🏗️ System Architecture & Engineering Case Study

```mermaid
flowchart TB
    subgraph Client ["Client Tier (React 18 + Vite + PWA)"]
        UI[ZeoAtlas Web UI]
        Composer[Message Composer & Voice Dictation]
        Canvas[Code Canvas Sandbox]
        TTS[Neural Text-to-Speech]
        PWA[Service Worker & Manifest Cache]
    end

    subgraph Auth ["Authentication Tier"]
        Clerk[Clerk Auth / JWT Tokens]
    end

    subgraph Backend ["Backend Tier (Node.js + Express)"]
        Server[Express Server]
        AuthMW[JWT / Clerk Middleware]
        DocExtract[PDF / DOCX Text Extractor]
        Router[Intent Router & Memory Engine]
    end

    subgraph ML_Service ["Machine Learning Tier (Python 3.10)"]
        IPC[Persistent stdio IPC Bridge]
        Classifier[Calibrated LinearSVC Model\n36 Intents | 100% Test Acc]
        VectorPipeline[Word & Char n-gram FeatureUnion]
    end

    subgraph GenAI ["Generative AI Tier"]
        Gemini[Google Gemini API]
        Grounding[Google Search Grounding Tool]
    end

    subgraph Storage ["Database Tier"]
        Mongo[(MongoDB Atlas Cloud)]
        UserColl[(Users & Custom Memories)]
        ConvColl[(Conversations & Messages)]
        ShareColl[(Public Shared Snapshots)]
    end

    UI --> Composer
    Composer -->|REST / SSE Stream| Server
    UI -->|Clerk Auth Flow| Clerk
    Clerk -->|Bearer Token| AuthMW
    AuthMW --> Server

    Server --> DocExtract
    Server --> Router

    Router -->|JSON via stdin| IPC
    IPC --> VectorPipeline --> Classifier
    Classifier -->|Predicted Intent & Confidence| IPC
    IPC -->|JSON via stdout| Router

    Router -->|Generative / Search Queries| Gemini
    Gemini --> Grounding

    Server --> Mongo
    Mongo --> UserColl
    Mongo --> ConvColl
    Mongo --> ShareColl

    Server -->|SSE Stream (data: chunk)| UI
    UI --> Canvas
    UI --> TTS
```

---

## 🔬 Machine Learning Pipeline & Dataset Engineering

### 1. Dataset Generation (`build_master_dataset.py`)
- **Dataset Size**: **29,275 balanced samples** across **36 distinct technical and conversational intents**.
- **Intent Classes**:
  - `python`, `javascript`, `web_development`, `programming`, `database_sql`, `algorithms`, `git_devops`, `cybersecurity`, `machine_learning`, `data_science`, `system_design`, `code_debugging`.
  - `summarize_simplify`, `capabilities`, `app_features`, `bot_identity`, `creator`, `chat_management`, `user_name_declare`, `user_name_query`.
  - `greeting`, `goodbye`, `thanks`, `help`, `how_are_you`, `age`, `time`, `weather`, `jokes`, `motivation`, `positive_feedback`, `negative_feedback`, `study_help`, `contact`, `unsupported_tasks`, `unknown`.

### 2. Feature Engineering & Modeling (`train_anti_overfitting.py`)
- **Hybrid Feature Union**:
  - **Word TF-IDF Vectorizer**: `ngram_range=(1, 3)`, `sublinear_tf=True`, `max_features=25,000`.
  - **Character N-Gram Vectorizer**: `analyzer='char_wb'`, `ngram_range=(3, 6)`, capturing typos, prefixes, and sub-word technical terminology.
- **Classifier**: `LinearSVC(C=0.5, penalty='l2', loss='squared_hinge', tol=1e-4)`.
- **Probability Calibration**: `CalibratedClassifierCV(estimator=LinearSVC, method='sigmoid', cv=5)` generates accurate confidence distributions between 0.0% and 100.0%.
- **Validation Results**:
  - **Test Accuracy**: `100.00%` (on 5,855 held-out generalization samples)
  - **Macro F1 Score**: `1.0000`
  - **Weighted Avg F1**: `1.0000`

### 3. High-Performance IPC Inference (`predict_api.py`)
- Persistent Python background process communicates with Node.js via standard input/output (`stdin`/`stdout`).
- Eliminates the 2.5-second cold-start latency of spawning new Python processes per query, providing **sub-5ms prediction response times**.

---

## 💻 Complete Tech Stack & Tools

### Frontend
- **Core Framework**: React 18.3, TypeScript, Vite 6
- **Styling**: TailwindCSS v4, Vanilla CSS Custom Properties (Theme Engine)
- **State Management**: Zustand
- **Animations**: Framer Motion
- **Markdown & Code Highlighting**: React Markdown, Remark GFM
- **Icons**: Lucide React
- **Notifications**: React Hot Toast
- **Audio & Voice**: Web Speech API (`SpeechRecognition`, `SpeechSynthesis`)
- **PWA & Caching**: Service Worker API, Web App Manifest

### Backend
- **Runtime**: Node.js v18+ (ES Modules)
- **Web Framework**: Express.js
- **Database & ODM**: MongoDB Atlas, Mongoose 8
- **Authentication**: Clerk Express SDK (`@clerk/express`), JWT (`jsonwebtoken`), BCrypt.js
- **Generative AI SDK**: Google Gen AI SDK (`@google/genai`)
- **File Parsing**: Multer, `pdf-parse`, `mammoth` (.docx), CSV parser
- **Streaming**: Server-Sent Events (SSE)

### Machine Learning & Data Science
- **Language**: Python 3.10+
- **Libraries**: Scikit-Learn, Pandas, NumPy, Joblib, SciPy
- **Model Storage**: Serialized Pickled Pipeline (`chatbot_intent_model.pkl`)

### Hosting & Infrastructure
- **Frontend Hosting**: Vercel (Custom Domain: `zeoatlas.tech`)
- **Backend & ML Server**: Render Cloud Web Service
- **Database**: MongoDB Atlas M0 Replica Cluster
- **Authentication Provider**: Clerk Cloud
- **CI/CD**: GitHub Actions / Git Automated Webhook Deploys

---

## 📂 Project Structure

```
Chatbot/
├── backend/
│   ├── src/
│   │   ├── config/             # Database & environment configurations
│   │   ├── controllers/        # Express route handlers (auth, chat, conversations, feedback)
│   │   ├── middleware/         # Auth verification, error handlers, rate limiters
│   │   ├── models/             # Mongoose schemas (User, Conversation, Message, SharedChat, Feedback)
│   │   ├── routes/             # API routing endpoints
│   │   ├── services/           # Chatbot service, Intent Router, LLM Service, ML IPC bridge
│   │   └── server.js           # Server entry point
│   ├── uploads/                # Temporary local file upload storage
│   ├── package.json
│   └── README.md
├── frontend/
│   ├── public/
│   │   ├── favicon.ico
│   │   ├── favicon.png
│   │   ├── logo.png            # Transparent glowing logo asset
│   │   ├── manifest.json       # PWA Manifest
│   │   └── sw.js               # Network-first Service Worker
│   ├── src/
│   │   ├── components/
│   │   │   ├── auth/           # Login & Register forms with password strength meters
│   │   │   ├── canvas/         # Side-by-Side Code Canvas sandbox & preview
│   │   │   ├── chat/           # MessageComposer, MessageBubble, MarkdownRenderer, ShareDialog
│   │   │   ├── layout/         # AppLayout, AuthLayout, ProtectedRoute
│   │   │   ├── settings/       # SettingsPanel (Themes, AI Creativity, Sound, Font Size)
│   │   │   └── sidebar/        # ConversationList, ConversationItem, Search bar
│   │   ├── hooks/              # Custom React hooks (useAutoResize)
│   │   ├── lib/                # Speech synthesis & utility functions
│   │   ├── pages/              # ChatPage, LoginPage, RegisterPage, SharedChatPage
│   │   ├── services/           # Axios API client & SSE stream reader
│   │   ├── stores/             # Zustand stores (chatStore, authStore, uiStore)
│   │   ├── types/              # TypeScript interfaces & API types
│   │   ├── App.tsx             # Root routing with React.lazy code-splitting
│   │   ├── main.tsx            # Entry point & PWA service worker registration
│   │   └── index.css           # Design tokens, variables & typography
│   ├── index.html
│   ├── vite.config.ts          # Rollup chunk splitting configuration
│   └── package.json
├── ml/
│   ├── data/
│   │   ├── build_master_dataset.py   # Dataset builder (29,275 samples)
│   │   └── chatbot_training_data.csv
│   ├── models/
│   │   ├── chatbot_intent_model.pkl  # Trained ML pipeline artifact
│   │   └── model_metadata.json
│   ├── predict_api.py                # Fast stdio IPC prediction worker
│   └── train_anti_overfitting.py     # Scikit-Learn training script
└── README.md                         # Project documentation
```

---

## 📡 API Endpoints

### 1. Authentication (`/api/auth`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/auth/register` | Register new local account | No |
| `POST` | `/api/auth/login` | Login and receive JWT token | No |
| `GET` | `/api/auth/me` | Retrieve authenticated user profile | Yes |
| `PATCH` | `/api/auth/profile` | Update profile (nickname, preferences) | Yes |

### 2. Chat & Streaming (`/api/chat`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/chat` | Send message (synchronous) | Yes |
| `POST` | `/api/chat/stream` | Send message & stream tokens via SSE | Yes |
| `POST` | `/api/chat/:id/share` | Generate public read-only share link | Yes |
| `GET` | `/api/chat/public/share/:shareId` | Retrieve shared conversation snapshot | **Public** |

### 3. Conversations (`/api/conversations`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/conversations` | List all conversations for user | Yes |
| `POST` | `/api/conversations` | Create a new conversation | Yes |
| `GET` | `/api/conversations/:id` | Get single conversation metadata | Yes |
| `PATCH` | `/api/conversations/:id` | Rename conversation | Yes |
| `PATCH` | `/api/conversations/:id/pin` | Toggle pin status | Yes |
| `DELETE` | `/api/conversations/:id` | Delete conversation and messages | Yes |
| `DELETE` | `/api/conversations` | Delete all user conversations | Yes |
| `GET` | `/api/conversations/:id/messages` | Get paginated message history | Yes |

### 4. Upload & Feedback (`/api`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/upload` | Upload & extract text from documents/images | Yes |
| `POST` | `/api/messages/:id/feedback` | Submit thumbs up/down rating | Yes |
| `GET` | `/api/health` | Service health status check | No |

---

## ⚙️ Environment Configuration

### Backend (`backend/.env`)
```env
PORT=8000
APP_NAME=ZeoAtlas
NODE_ENV=production

# Database
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/zeoatlas?retryWrites=true&w=majority

# Authentication
JWT_SECRET=your_super_secret_jwt_key
CLERK_SECRET_KEY=sk_live_your_clerk_secret_key

# Generative AI & ML
GEMINI_API_KEY=your_google_gemini_api_key
GEMINI_MODEL=gemini-2.5-flash
CHATBOT_MODE=real
ML_CONFIDENCE_THRESHOLD=0.50

# CORS
CORS_ORIGINS=https://www.zeoatlas.tech,https://zeoatlas.tech,http://localhost:5173
```

### Frontend (`frontend/.env`)
```env
VITE_API_URL=https://atlas-backend-production-url.onrender.com/api
VITE_CLERK_PUBLISHABLE_KEY=pk_live_your_clerk_publishable_key
```

---

## 🛠️ Getting Started Locally

### 1. Prerequisites
- **Node.js**: v18.0.0 or higher
- **Python**: v3.10 or higher
- **MongoDB**: Local MongoDB or free MongoDB Atlas URI

### 2. Clone Repository
```bash
git clone https://github.com/Hafiz-Noman-Nawaz/Atlas.git
cd Atlas
```

### 3. Setup Backend & Python ML Environment
```bash
# In project root
cd backend
npm install

# Setup Python dependencies
cd ../ml
python -m venv venv
# Windows:
.\venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

pip install scikit-learn pandas numpy joblib
```

### 4. Train the ML Model (Optional — Pre-trained artifact included)
```bash
python data/build_master_dataset.py
python train_anti_overfitting.py
```

### 5. Setup Frontend
```bash
cd ../frontend
npm install
```

### 6. Run the Application
- **Start Backend**:
  ```bash
  cd backend
  npm run dev
  ```
- **Start Frontend**:
  ```bash
  cd frontend
  npm run dev
  ```
- Open `http://localhost:5173` in your browser.

---

## 💡 Engineering Challenges & Key Solutions

### 1. Zero-Overhead Python ↔ Node.js IPC
- **Challenge**: Executing a Python script per incoming chat message created 1.5–2.5 seconds of overhead due to interpreter startup.
- **Solution**: Built a persistent stdio IPC worker (`predict_api.py`). Node.js maintains an open child process that passes JSON payloads over `stdin` and reads predictions over `stdout` in < 5ms.

### 2. Token Streaming Performance & Layout Thrashing
- **Challenge**: Server-Sent Events stream ~20 chunks per second. Updating React state caused all 50+ message bubbles in history to re-render, creating noticeable frame drops.
- **Solution**: Wrapped `MessageBubble` and `MarkdownRenderer` in `React.memo` with custom prop comparators. Only the actively streaming assistant bubble updates, keeping UI at 60 FPS.

### 3. Stale Deployment White-Screens & Service Worker Cache Busting
- **Challenge**: PWA service workers aggressively cached `index.html`. Deploying new chunk hashes caused 404 MIME errors when the old HTML requested deleted scripts.
- **Solution**: Implemented a **Network-First** service worker strategy for HTML documents, coupled with Vite's `vite:preloadError` auto-reload hook.

---

## 👨‍💻 Author & Acknowledgments

- **Lead Developer**: **Hafiz Noman Nawaz**
- **GitHub**: [@Hafiz-Noman-Nawaz](https://github.com/Hafiz-Noman-Nawaz)
- **Live Platform**: [https://www.zeoatlas.tech](https://www.zeoatlas.tech)

---

## 📄 License
This project is licensed under the [MIT License](LICENSE).
