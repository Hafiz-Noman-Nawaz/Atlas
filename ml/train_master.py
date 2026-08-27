"""
Master Model Training Script for Atlas Chatbot.
Generates comprehensive augmented training data, builds hybrid word + char_wb vectorizer,
trains calibrated LinearSVC / LogisticRegression, and saves model to ml/models/chatbot_intent_model.pkl.
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
from sklearn.linear_model import LogisticRegression
from sklearn.svm import LinearSVC
from sklearn.calibration import CalibratedClassifierCV
from sklearn.naive_bayes import ComplementNB
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, classification_report

# Import dataset builder
from data.build_master_dataset import build_master_dataset

def main():
    current_dir = os.path.dirname(os.path.abspath(__file__))
    data_csv = os.path.join(current_dir, "data", "chatbot_training_data.csv")
    models_dir = os.path.join(current_dir, "models")
    os.makedirs(models_dir, exist_ok=True)

    print("=" * 60)
    print("1. BUILDING EXPANDED MASTER DATASET")
    print("=" * 60)
    df = build_master_dataset(data_csv, target_samples_per_intent=160)
    
    unique_intents = sorted(df['intent'].unique().tolist())
    print(f"Total samples: {len(df)}")
    print(f"Total intents ({len(unique_intents)}): {unique_intents}")

    X = df['text'].astype(str).str.strip()
    y = df['intent'].astype(str).str.strip()

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.20, stratify=y, random_state=42
    )

    print("\n" + "=" * 60)
    print("2. TRAINING HYBRID WORD + CHAR_WB CLASSIFIER")
    print("=" * 60)

    hybrid_vectorizer = FeatureUnion([
        ("word_tfidf", TfidfVectorizer(
            ngram_range=(1, 3),
            sublinear_tf=True,
            strip_accents='unicode',
            lowercase=True,
            min_df=1,
            analyzer='word'
        )),
        ("char_tfidf", TfidfVectorizer(
            ngram_range=(3, 5),
            sublinear_tf=True,
            strip_accents='unicode',
            lowercase=True,
            min_df=1,
            analyzer='char_wb'
        ))
    ])

    candidates = {
        "LinearSVC (Calibrated)": Pipeline([
            ("tfidf", hybrid_vectorizer),
            ("clf", CalibratedClassifierCV(LinearSVC(C=1.0, random_state=42), cv=5))
        ]),
        "LogisticRegression": Pipeline([
            ("tfidf", hybrid_vectorizer),
            ("clf", LogisticRegression(C=2.0, max_iter=1000, random_state=42))
        ]),
    }

    best_name = None
    best_pipeline = None
    best_f1 = -1.0
    results = {}

    for name, pipeline in candidates.items():
        print(f"Training {name}...")
        pipeline.fit(X_train, y_train)
        y_pred = pipeline.predict(X_test)

        acc = accuracy_score(y_test, y_pred)
        prec = precision_score(y_test, y_pred, average='macro', zero_division=0)
        rec = recall_score(y_test, y_pred, average='macro', zero_division=0)
        f1 = f1_score(y_test, y_pred, average='macro', zero_division=0)

        results[name] = {
            "Accuracy": acc,
            "Precision": prec,
            "Recall": rec,
            "Macro F1": f1
        }
        print(f"  -> Accuracy: {acc:.4f}, Macro F1: {f1:.4f}")

        if f1 > best_f1:
            best_f1 = f1
            best_name = name
            best_pipeline = pipeline

    print(f"\n>>> Best Model: {best_name} (Macro F1 = {best_f1:.4f})")

    # Evaluate best model
    y_pred_best = best_pipeline.predict(X_test)
    print("\nClassification Report:\n")
    print(classification_report(y_test, y_pred_best, zero_division=0))

    # Save to disk
    model_path = os.path.join(models_dir, "chatbot_intent_model.pkl")
    meta_path = os.path.join(models_dir, "model_metadata.json")

    joblib.dump(best_pipeline, model_path)
    print(f"\n[OK] Model successfully serialized to: {model_path}")

    metadata = {
        "model_name": best_name,
        "training_timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat(),
        "total_examples": len(df),
        "num_intents": len(unique_intents),
        "intents": unique_intents,
        "confidence_threshold": 0.50,
        "evaluation_metrics": {
            "accuracy": round(float(results[best_name]["Accuracy"]), 4),
            "macro_f1": round(float(results[best_name]["Macro F1"]), 4)
        }
    }

    with open(meta_path, "w", encoding="utf-8") as f:
        json.dump(metadata, f, indent=2)
    print(f"[OK] Metadata saved to: {meta_path}")

    print("\n" + "=" * 60)
    print("TRAINING FINISHED SUCCESSFULLY")
    print("=" * 60)

if __name__ == "__main__":
    main()
