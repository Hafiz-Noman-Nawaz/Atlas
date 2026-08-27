"""
Chatbot Intent Classification - Model Evaluation & Error Analysis
Performs in-depth evaluation on test data, confusion matrix analysis, and intent pair confusion diagnostics.
"""

import os
import sys
import json
import argparse
import joblib
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns

from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, confusion_matrix, accuracy_score, f1_score


def evaluate_model(data_path=None, model_path=None, output_dir=None):
    """Run comprehensive model evaluation and error analysis."""
    # Resolve paths
    base_dir = os.path.dirname(__file__)
    if not data_path:
        candidates = [
            os.path.join(base_dir, "data", "chatbot_training_data.csv"),
            os.path.join(base_dir, "..", "data", "chatbot_training_data.csv"),
            os.path.join("data", "chatbot_training_data.csv")
        ]
        for c in candidates:
            if os.path.exists(c):
                data_path = c
                break
    
    if not model_path:
        model_candidates = [
            os.path.join(base_dir, "models", "chatbot_intent_model.pkl"),
            os.path.join("ml", "models", "chatbot_intent_model.pkl")
        ]
        for m in model_candidates:
            if os.path.exists(m):
                model_path = m
                break

    if not data_path or not os.path.exists(data_path):
        raise FileNotFoundError(f"Data file not found: {data_path}")
    if not model_path or not os.path.exists(model_path):
        raise FileNotFoundError(f"Model file not found: {model_path}")

    print("=" * 70)
    print("DETAILED MODEL EVALUATION & ERROR ANALYSIS")
    print("=" * 70)
    print(f"Data Source:  {data_path}")
    print(f"Model Source: {model_path}")

    # Load data
    df = pd.read_csv(data_path).dropna(subset=['text', 'intent'])
    df['text_clean'] = df['text'].astype(str).str.strip()
    df['intent'] = df['intent'].astype(str).str.strip()
    df = df[df['text_clean'] != ""].copy()

    labels = sorted(df['intent'].unique().tolist())

    # Stratified test split identical to training
    X = df['text_clean']
    y = df['intent']
    raw_texts = df['text'].tolist()

    X_train, X_test, y_train, y_test, train_idx, test_idx = train_test_split(
        X, y, df.index, test_size=0.20, stratify=y, random_state=42
    )
    raw_texts_test = [raw_texts[i] for i in test_idx]

    # Load pipeline
    pipeline = joblib.load(model_path)

    # Predict
    y_pred = pipeline.predict(X_test)
    probs = pipeline.predict_proba(X_test) if hasattr(pipeline, "predict_proba") else None

    # Calculate overall metrics
    acc = accuracy_score(y_test, y_pred)
    macro_f1 = f1_score(y_test, y_pred, average='macro', zero_division=0)
    weighted_f1 = f1_score(y_test, y_pred, average='weighted', zero_division=0)

    print(f"\nOverall Test Metrics:")
    print(f"  - Accuracy:    {acc:.4f} ({acc*100:.2f}%)")
    print(f"  - Macro F1:    {macro_f1:.4f}")
    print(f"  - Weighted F1: {weighted_f1:.4f}")

    # Detailed report per class
    print("\n" + "=" * 70)
    print("PER-CLASS CLASSIFICATION REPORT")
    print("=" * 70)
    print(classification_report(y_test, y_pred, labels=labels, zero_division=0))

    # Error analysis
    y_test_arr = np.array(y_test)
    misclassified_idx = np.where(y_test_arr != y_pred)[0]

    print("\n" + "=" * 70)
    print(f"MISCLASSIFICATION ANALYSIS ({len(misclassified_idx)} errors out of {len(y_test)} test examples)")
    print("=" * 70)

    if len(misclassified_idx) > 0:
        error_df = pd.DataFrame({
            "Text": [raw_texts_test[i] for i in misclassified_idx],
            "Actual": [y_test_arr[i] for i in misclassified_idx],
            "Predicted": [y_pred[i] for i in misclassified_idx],
            "Confidence": [float(np.max(probs[i])) if probs is not None else 1.0 for i in misclassified_idx]
        })
        print(error_df.to_string(index=False))

        # Problematic intent pairs
        print("\nTop Confused Intent Pairs (Actual -> Predicted):")
        confusion_pairs = error_df.groupby(['Actual', 'Predicted']).size().reset_index(name='Count').sort_values('Count', ascending=False)
        print(confusion_pairs.to_string(index=False))
    else:
        print("Zero misclassifications found on the test set!")

    return {
        "accuracy": acc,
        "macro_f1": macro_f1,
        "weighted_f1": weighted_f1,
        "num_errors": len(misclassified_idx)
    }


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Evaluate Intent Classification Model")
    parser.add_argument("--data", type=str, default=None, help="Path to test CSV")
    parser.add_argument("--model", type=str, default=None, help="Path to model pkl")
    args = parser.parse_args()

    evaluate_model(args.data, args.model)
