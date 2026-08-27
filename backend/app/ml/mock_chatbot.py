"""
Temporary mock chatbot implementation.

This provides realistic placeholder responses while the ML model
is being developed. It uses simple keyword matching to return
contextually relevant responses.

Replace this with MLChatbot once your model is trained.
"""

import random

from app.ml.base import ChatbotInterface, ChatbotResponse

# Response pools organized by detected topic
_RESPONSES: dict[str, list[str]] = {
    "order_tracking": [
        "I can help you track your order. Could you please provide your order number? "
        "It usually starts with 'ORD-' followed by digits.",
        "To look up your order status, I'll need your order number or the email "
        "address associated with your account.",
        "Sure! I'd be happy to help you find your order. Please share your order "
        "number and I'll pull up the details right away.",
    ],
    "returns": [
        "Our return policy allows returns within 30 days of delivery. The item "
        "must be in its original condition. Would you like me to start a return?",
        "I can help you with a return. You can initiate one from your order history, "
        "or I can guide you through the process here.",
        "Returns are accepted within 30 days for most items. Refunds are processed "
        "within 5–7 business days after we receive the item.",
    ],
    "payment": [
        "We accept Visa, Mastercard, American Express, PayPal, and Apple Pay. "
        "Is there a specific payment method you'd like to know more about?",
        "Payment is processed securely at checkout. If you're having trouble with "
        "a payment, I can help troubleshoot the issue.",
        "We support all major credit and debit cards, as well as digital wallets. "
        "All transactions are encrypted end-to-end.",
    ],
    "shipping": [
        "Standard shipping typically takes 5–7 business days. Express shipping "
        "delivers within 2–3 business days for an additional fee.",
        "We ship to most locations domestically and internationally. Shipping "
        "costs are calculated at checkout based on your address.",
        "Free shipping is available on orders over $50. You'll receive a tracking "
        "number via email once your order ships.",
    ],
    "account": [
        "You can update your account information from the Settings page. "
        "Need help with a specific account setting?",
        "To reset your password, click 'Forgot Password' on the login page and "
        "follow the instructions sent to your email.",
        "Your account settings let you manage your profile, payment methods, "
        "and notification preferences.",
    ],
    "greeting": [
        "Hello! Welcome to Atlas. How can I help you today?",
        "Hi there! I'm here to assist you. What can I do for you?",
        "Hey! Good to see you. Feel free to ask me anything.",
    ],
    "farewell": [
        "Thanks for chatting with me! Have a great day.",
        "Glad I could help. Don't hesitate to reach out if you need anything else!",
        "Take care! I'm here whenever you need assistance.",
    ],
    "general": [
        "That's a great question. Let me help you with that. Could you provide "
        "a few more details so I can give you the most accurate answer?",
        "I'd be happy to assist with that. Can you tell me a bit more about "
        "what you're looking for?",
        "Thanks for reaching out! I want to make sure I help you properly — "
        "could you elaborate on what you need?",
        "I understand. Let me look into that for you. In the meantime, is there "
        "anything else I can help with?",
    ],
}

# Keyword-to-topic mapping
_KEYWORDS: dict[str, list[str]] = {
    "order_tracking": ["track", "order", "status", "where is", "delivery", "shipped", "package"],
    "returns": ["return", "refund", "exchange", "send back", "money back"],
    "payment": ["pay", "payment", "credit card", "billing", "charge", "invoice", "price"],
    "shipping": ["ship", "shipping", "deliver", "delivery time", "express", "free shipping"],
    "account": ["account", "password", "profile", "settings", "email", "login", "sign in"],
    "greeting": ["hello", "hi", "hey", "good morning", "good afternoon", "good evening"],
    "farewell": ["bye", "goodbye", "thanks", "thank you", "see you", "that's all"],
}


def _detect_topic(message: str) -> str:
    """Simple keyword matching to determine the topic of a message."""
    message_lower = message.lower()
    for topic, keywords in _KEYWORDS.items():
        if any(kw in message_lower for kw in keywords):
            return topic
    return "general"


class MockChatbot(ChatbotInterface):
    """
    Temporary chatbot that returns realistic responses using keyword matching.

    This implementation does NOT use ML. It exists solely as a placeholder
    so the full application stack (frontend → API → chatbot) can be tested
    end-to-end before the ML model is ready.
    """

    async def get_response(
        self,
        user_message: str,
        conversation_history: list[dict] | None = None,
    ) -> ChatbotResponse:
        topic = _detect_topic(user_message)
        response_text = random.choice(_RESPONSES[topic])

        return ChatbotResponse(
            message=response_text,
            intent=None,       # Mock doesn't predict intent
            confidence=None,   # Mock doesn't produce confidence scores
        )
