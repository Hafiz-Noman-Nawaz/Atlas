"""
ML-powered chatbot implementation — STUB.

This file is a blueprint for your future ML model integration.
DO NOT use this class until your model is trained.

Integration steps:
1. Train your model (scikit-learn, TF-IDF, etc.)
2. Save artifacts with joblib:
   - joblib.dump(model, "app/ml/artifacts/model.joblib")
   - joblib.dump(vectorizer, "app/ml/artifacts/vectorizer.joblib")
3. Implement the get_response method below
4. Swap MockChatbot for MLChatbot in app/main.py
"""

from app.ml.base import ChatbotInterface, ChatbotResponse


class MLChatbot(ChatbotInterface):
    """
    Future ML-powered chatbot.

    Expected pipeline:
        User Message
            → Text Preprocessing (lowercasing, stopword removal, etc.)
            → TF-IDF Vectorizer
            → Trained Classifier (Logistic Regression, SVM, etc.)
            → Intent Prediction + Confidence Score
            → Response Selection from intent-response mapping
            → ChatbotResponse
    """

    def __init__(self, model_path: str = "app/ml/artifacts/model.joblib"):
        # TODO: Load your trained model and vectorizer here
        # self.model = joblib.load(model_path)
        # self.vectorizer = joblib.load("app/ml/artifacts/vectorizer.joblib")
        # self.response_map = {...}  # intent → response text mapping
        raise NotImplementedError(
            "ML model is not trained yet. Use MockChatbot instead. "
            "See this file's docstring for integration instructions."
        )

    async def get_response(
        self,
        user_message: str,
        conversation_history: list[dict] | None = None,
    ) -> ChatbotResponse:
        # TODO: Implement when model is ready
        #
        # Example implementation:
        #   preprocessed = preprocess(user_message)
        #   vector = self.vectorizer.transform([preprocessed])
        #   intent = self.model.predict(vector)[0]
        #   probabilities = self.model.predict_proba(vector)[0]
        #   confidence = float(max(probabilities))
        #   response_text = self.response_map.get(intent, "I'm not sure I understand.")
        #
        #   return ChatbotResponse(
        #       message=response_text,
        #       intent=intent,
        #       confidence=confidence,
        #   )
        raise NotImplementedError("ML model not implemented yet.")
