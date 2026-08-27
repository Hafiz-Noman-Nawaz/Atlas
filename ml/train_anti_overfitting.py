"""
High-Intelligence Anti-Overfitting Training Pipeline for Atlas Chatbot.
Trains on >26,000 diverse samples across 32 intents with character+word TF-IDF FeatureUnion,
L2 Regularized LinearSVC with Calibrated Probability Estimates.
"""

import os
import sys
import json
import datetime
import numpy as np
import pandas as pd
import joblib

from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.pipeline import Pipeline, FeatureUnion
from sklearn.svm import LinearSVC
from sklearn.calibration import CalibratedClassifierCV
from sklearn.metrics import classification_report, accuracy_score, f1_score

from data.build_master_dataset import build_master_dataset

def main():
    current_dir = os.path.dirname(os.path.abspath(__file__))
    data_path = os.path.join(current_dir, "data", "chatbot_training_data.csv")
    models_dir = os.path.join(current_dir, "models")
    os.makedirs(models_dir, exist_ok=True)

    print("=" * 70)
    print("1. GENERATING EXPANDED HIGH-INTELLIGENCE DATASET (800 samples/intent)")
    print("=" * 70)
    df = build_master_dataset(data_path, target_samples_per_intent=800)
    print(f"Total dataset size: {len(df)} samples across {df['intent'].nunique()} intents.")

    X = df['text'].astype(str).str.strip()
    y = df['intent'].astype(str).str.strip()

    # Stratified 80/20 train/test split
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.20, stratify=y, random_state=42
    )

    print(f"Training Set: {len(X_train)} samples | Test Set: {len(X_test)} samples")

    print("\n" + "=" * 70)
    print("2. BUILDING REGULARIZED HYBRID N-GRAM FEATURE PIPELINE")
    print("=" * 70)

    # FeatureUnion with word (1-3) and character (3-6) n-grams for robust typo & code tolerance
    hybrid_vectorizer = FeatureUnion([
        ("word_tfidf", TfidfVectorizer(
            ngram_range=(1, 3),
            sublinear_tf=True,
            strip_accents='unicode',
            lowercase=True,
            min_df=1,
            max_df=0.90,
            analyzer='word'
        )),
        ("char_tfidf", TfidfVectorizer(
            ngram_range=(3, 6),
            sublinear_tf=True,
            strip_accents='unicode',
            lowercase=True,
            min_df=1,
            max_df=0.90,
            analyzer='char_wb'
        ))
    ])

    # Regularized Calibrated LinearSVC (C=0.85 with 5-fold internal calibration)
    pipeline = Pipeline([
        ("tfidf", hybrid_vectorizer),
        ("clf", CalibratedClassifierCV(
            LinearSVC(C=0.85, penalty='l2', max_iter=3000, random_state=42),
            cv=5
        ))
    ])

    print("Fitting model on training set...")
    pipeline.fit(X_train, y_train)

    print("\n" + "=" * 70)
    print("3. EVALUATION ON HELD-OUT GENERALIZATION TEST SET")
    print("=" * 70)
    y_pred = pipeline.predict(X_test)
    test_acc = accuracy_score(y_test, y_pred)
    test_f1 = f1_score(y_test, y_pred, average='macro', zero_division=0)

    print(f"Generalization Test Accuracy: {test_acc:.4f} ({test_acc * 100:.2f}%)")
    print(f"Generalization Macro F1 Score: {test_f1:.4f}")
    print("\nDetailed Intent Classification Report:\n")
    print(classification_report(y_test, y_pred, zero_division=0))

    # Train on complete dataset for production serialization
    print("=" * 70)
    print("4. PRODUCTION SERIALIZATION")
    print("=" * 70)
    pipeline.fit(X, y)

    model_path = os.path.join(models_dir, "chatbot_intent_model.pkl")
    meta_path = os.path.join(models_dir, "model_metadata.json")

    if os.path.exists(model_path):
        os.remove(model_path)

    joblib.dump(pipeline, model_path)
    print(f"[OK] Model successfully serialized to: {model_path}")

    metadata = {
        "model_name": "Calibrated LinearSVC (L2 Regularized C=0.85, Hybrid Word+Char N-grams)",
        "training_timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat(),
        "total_examples": len(df),
        "num_intents": df['intent'].nunique(),
        "intents": sorted(df['intent'].unique().tolist()),
        "confidence_threshold": 0.50,
        "evaluation_metrics": {
            "test_accuracy": round(float(test_acc), 4),
            "macro_f1": round(float(test_f1), 4),
        }
    }

    with open(meta_path, "w", encoding="utf-8") as f:
        json.dump(metadata, f, indent=2)
    print(f"[OK] Metadata written to: {meta_path}")

    print("\n--- Spot-Check Generalization Tests ---")
    test_queries = [
        "can I change the name of this chat?",
        "what can you do and what can't you do?",
        "write a jawascript code which uses event listener to change the color of the box",
        "write a python code for prime numbers",
        "My name is noman",
        "what is my name?",
        "How to undo last git commit?",
        "can you order pizza for me?",
        "Explain compound indexes in MongoDB",
        "How to resolve TypeError: Cannot read properties of undefined in React?",
        "asdfghjkl"
    ]

    for q in test_queries:
        probs = pipeline.predict_proba([q])[0]
        top_intent, top_score = sorted(zip(pipeline.classes_, probs), key=lambda x: x[1], reverse=True)[0]
        print(f'"{q[:50]}..." -> {top_intent} ({top_score * 100:.1f}%)')

    print("\n" + "=" * 70)
    print("TRAINING FINISHED SUCCESSFULLY WITH MAXIMUM GENERALIZATION")
    print("=" * 70)

if __name__ == "__main__":
    main()
