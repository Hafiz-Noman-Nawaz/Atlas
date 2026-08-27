"""
Abstract interface for the chatbot service.

All chatbot implementations (mock, ML model, future NLP pipelines)
must implement this interface. This ensures the rest of the application
is decoupled from the specific chatbot implementation.
"""

from abc import ABC, abstractmethod

from pydantic import BaseModel


class ChatbotResponse(BaseModel):
    """Standard response from any chatbot implementation."""
    message: str
    intent: str | None = None
    confidence: float | None = None


class ChatbotInterface(ABC):
    """
    Abstract base class for chatbot implementations.

    To integrate a new chatbot:
    1. Create a new class that inherits from ChatbotInterface
    2. Implement the get_response method
    3. Swap the instance in app/main.py
    """

    @abstractmethod
    async def get_response(
        self,
        user_message: str,
        conversation_history: list[dict] | None = None,
    ) -> ChatbotResponse:
        """
        Generate a response to the user's message.

        Args:
            user_message: The current message from the user.
            conversation_history: Optional list of previous messages in the
                conversation, each with 'role' and 'content' keys.

        Returns:
            ChatbotResponse with message text and optional ML metadata.
        """
        ...
