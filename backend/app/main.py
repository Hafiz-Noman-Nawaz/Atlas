"""
Atlas Chatbot — FastAPI Application Entry Point

This is the main application file. It:
- Creates the FastAPI app with metadata
- Configures CORS middleware
- Mounts all API routers
- Initializes the chatbot service
- Provides a health check endpoint
"""

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import auth, chat, conversations, feedback
from app.core.config import settings
from app.ml.mock_chatbot import MockChatbot


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan — startup and shutdown events."""

    # Initialize the chatbot service
    # Swap MockChatbot for MLChatbot here when your model is ready
    chatbot = MockChatbot()
    chat.set_chatbot(chatbot)

    yield

    # Cleanup (if needed in the future)


app = FastAPI(
    title=settings.APP_NAME,
    description="A production-quality chatbot API built for ML integration.",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount routers under /api prefix
app.include_router(auth.router, prefix="/api")
app.include_router(conversations.router, prefix="/api")
app.include_router(chat.router, prefix="/api")
app.include_router(feedback.router, prefix="/api")


@app.get("/api/health", tags=["Health"])
async def health_check():
    return {"status": "healthy", "app": settings.APP_NAME}
