"""
Chatbot Intent Classification - Inference Module
Loads serialized ML pipeline and performs intent prediction with confidence thresholding.
"""

import os
import sys
import json
import argparse
import joblib
import numpy as np

DEFAULT_THRESHOLD = 0.50


def resolve_model_paths(custom_model_path=None, custom_meta_path=None):
    """Dynamically resolve path to model and metadata files."""
    if custom_model_path and os.path.exists(custom_model_path):
        model_path = custom_model_path
    else:
        candidates = [
            os.path.join(os.path.dirname(__file__), "models", "chatbot_intent_model.pkl"),
            os.path.join("ml", "models", "chatbot_intent_model.pkl"),
            os.path.join("models", "chatbot_intent_model.pkl")
        ]
        model_path = None
        for p in candidates:
            if os.path.exists(p):
                model_path = os.path.abspath(p)
                break
        if model_path is None:
            raise FileNotFoundError(f"Trained model file not found in: {candidates}. Please run train.py first.")

    meta_path = None
    if custom_meta_path and os.path.exists(custom_meta_path):
        meta_path = custom_meta_path
    else:
        meta_candidates = [
            os.path.join(os.path.dirname(model_path), "model_metadata.json"),
            os.path.join(os.path.dirname(__file__), "models", "model_metadata.json"),
            os.path.join("ml", "models", "model_metadata.json")
        ]
        for p in meta_candidates:
            if os.path.exists(p):
                meta_path = os.path.abspath(p)
                break

    return model_path, meta_path


class IntentPredictor:
    """Inference wrapper for trained intent classification pipeline."""

    def __init__(self, model_path=None, meta_path=None, threshold=None):
        self.model_path, self.meta_path = resolve_model_paths(model_path, meta_path)
        self.pipeline = joblib.load(self.model_path)
        
        self.metadata = {}
        if self.meta_path and os.path.exists(self.meta_path):
            try:
                with open(self.meta_path, "r", encoding="utf-8") as f:
                    self.metadata = json.load(f)
            except Exception as e:
                print(f"Warning: Could not read metadata file: {e}")

        # Set default threshold from metadata or fallback
        if threshold is not None:
            self.threshold = float(threshold)
        elif "confidence_threshold" in self.metadata:
            self.threshold = float(self.metadata["confidence_threshold"])
        else:
            self.threshold = DEFAULT_THRESHOLD

    def predict_intent(self, text: str, threshold: float = None) -> dict:
        """
        Predict intent for a given input text.
        
        Returns:
            dict: {
                "intent": str (or "unknown" if confidence < threshold),
                "confidence": float (0.0 to 1.0),
                "raw_intent": str,
                "is_confident": bool,
                "top_predictions": list of {"intent": str, "confidence": float}
            }
        """
        thresh = threshold if threshold is not None else self.threshold

        if not text or not isinstance(text, str) or text.strip() == "":
            return {
                "intent": "unknown",
                "confidence": 0.0,
                "raw_intent": "unknown",
                "is_confident": False,
                "top_predictions": []
            }

        cleaned_text = text.strip()

        # Check if pipeline supports predict_proba
        if hasattr(self.pipeline, "predict_proba"):
            probs = self.pipeline.predict_proba([cleaned_text])[0]
            classes = self.pipeline.classes_
            
            # Sort predictions by probability descending
            top_indices = np.argsort(probs)[::-1]
            top_class = classes[top_indices[0]]
            max_prob = float(probs[top_indices[0]])

            top_predictions = [
                {"intent": classes[i], "confidence": round(float(probs[i]), 4)}
                for i in top_indices[:3]
            ]
        elif hasattr(self.pipeline, "decision_function"):
            # Decision function softmax approximation if needed
            scores = self.pipeline.decision_function([cleaned_text])[0]
            classes = self.pipeline.classes_
            exp_scores = np.exp(scores - np.max(scores))
            probs = exp_scores / exp_scores.sum()
            top_indices = np.argsort(probs)[::-1]
            top_class = classes[top_indices[0]]
            max_prob = float(probs[top_indices[0]])
            top_predictions = [
                {"intent": classes[i], "confidence": round(float(probs[i]), 4)}
                for i in top_indices[:3]
            ]
        else:
            pred = self.pipeline.predict([cleaned_text])[0]
            top_class = pred
            max_prob = 1.0
            top_predictions = [{"intent": top_class, "confidence": 1.0}]

        is_confident = max_prob >= thresh
        final_intent = top_class if is_confident else "unknown"

        return {
            "intent": final_intent,
            "confidence": round(max_prob, 4),
            "raw_intent": top_class,
            "is_confident": is_confident,
            "top_predictions": top_predictions
        }


# Global singleton instance for quick function calls
_predictor_instance = None


def predict_intent(text: str, threshold: float = None) -> dict:
    """Convenience function to predict intent directly."""
    global _predictor_instance
    if _predictor_instance is None:
        _predictor_instance = IntentPredictor()
    return _predictor_instance.predict_intent(text, threshold)


def run_manual_test_suite():
    """Run test predictions on predefined sample queries."""
    predictor = IntentPredictor()
    test_queries = [
        "Hey bro",
        "Who are you?",
        "What can you do?",
        "How do I learn Python?",
        "Explain machine learning",
        "How do I build a React website?",
        "Tell me a joke",
        "Thanks for your help",
        "Bye",
        "Can you help me solve a coding bug?",
        "What's the weather today?",
        "What time is it in Tokyo?",
        "You are terrible at this",
        "You did an amazing job!",
        "Supercalifragilisticexpialidocious quantum toaster",
        "Where is the nearest spaceship repair shop?"
    ]

    print("\n" + "=" * 80)
    print("MANUAL INFERENCE TEST SUITE")
    print(f"Confidence Threshold: {predictor.threshold}")
    print("=" * 80)
    print(f"{'Input Text':<45} | {'Predicted Intent':<20} | {'Confidence':<10}")
    print("-" * 80)

    for q in test_queries:
        res = predictor.predict_intent(q)
        print(f"{q:<45} | {res['intent']:<20} | {res['confidence']:<10.4f}")
    print("=" * 80)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Predict intent for conversational text")
    parser.add_argument("text", nargs="?", type=str, default=None, help="User input text")
    parser.add_argument("--threshold", type=float, default=None, help="Confidence threshold")
    parser.add_argument("--test_suite", action="store_true", help="Run automated test suite")
    parser.add_argument("--json", action="store_true", help="Output raw JSON format")
    args = parser.parse_args()

    if args.test_suite:
        run_manual_test_suite()
    elif args.text:
        res = predict_intent(args.text, threshold=args.threshold)
        if args.json:
            print(json.dumps(res, indent=2))
        else:
            print(f"Input:       {args.text}")
            print(f"Intent:      {res['intent']}")
            print(f"Confidence:  {res['confidence']}")
            print(f"Top 3:       {res['top_predictions']}")
    else:
        # Interactive REPL
        print("Intent Prediction REPL (type 'exit' or 'quit' to stop)")
        predictor = IntentPredictor(threshold=args.threshold)
        while True:
            try:
                user_input = input("\nEnter query > ").strip()
                if user_input.lower() in ("exit", "quit"):
                    break
                if not user_input:
                    continue
                result = predictor.predict_intent(user_input)
                print(f"-> Intent: {result['intent']} (Confidence: {result['confidence']:.2%})")
            except (KeyboardInterrupt, EOFError):
                break
