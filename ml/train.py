"""
Chatbot Intent Classification - Model Training Pipeline
Trains multiple ML classifiers, benchmarks performance (Macro F1, Accuracy, etc.),
selects the best performing model, and serializes the complete pipeline and metadata.
"""

import os
import sys
import json
import argparse
import datetime
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
import joblib

from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.pipeline import Pipeline, FeatureUnion
from sklearn.linear_model import LogisticRegression
from sklearn.svm import LinearSVC
from sklearn.calibration import CalibratedClassifierCV
from sklearn.naive_bayes import MultinomialNB, ComplementNB
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    classification_report,
    confusion_matrix
)

CONFIDENCE_THRESHOLD = 0.50


def resolve_data_path(custom_path=None):
    """Resolve training data CSV path dynamically."""
    if custom_path and os.path.exists(custom_path):
        return custom_path
    
    candidates = [
        os.path.join(os.path.dirname(__file__), "data", "chatbot_training_data.csv"),
        os.path.join(os.path.dirname(__file__), "..", "data", "chatbot_training_data.csv"),
        os.path.join("data", "chatbot_training_data.csv"),
        os.path.join("ml", "data", "chatbot_training_data.csv")
    ]
    for p in candidates:
        if os.path.exists(p):
            return os.path.abspath(p)
    raise FileNotFoundError(f"Could not locate chatbot_training_data.csv in candidate paths: {candidates}")


def preprocess_text(text):
    """Normalize text: convert to string, strip whitespace, lowercase."""
    if not isinstance(text, str):
        return ""
    text = text.strip()
    return text


def load_and_inspect_dataset(csv_path):
    """Load dataset, inspect quality, and clean rows."""
    print(f"\n" + "=" * 60)
    print(f"1. DATASET INSPECTION & LOADING")
    print(f"=" * 60)
    print(f"Source file: {csv_path}")

    df = pd.read_csv(csv_path)
    print(f"Total rows loaded: {len(df)}")
    print(f"Columns present: {list(df.columns)}")

    # Verify columns
    if 'text' not in df.columns or 'intent' not in df.columns:
        raise ValueError(f"Expected columns ['text', 'intent'], but found: {list(df.columns)}")

    # Check missing values
    null_text = df['text'].isnull().sum()
    null_intent = df['intent'].isnull().sum()
    print(f"Missing text values: {null_text}")
    print(f"Missing intent values: {null_intent}")

    # Drop nulls if any
    df = df.dropna(subset=['text', 'intent']).copy()

    # Preprocess text and strip whitespace
    df['text_clean'] = df['text'].apply(preprocess_text)
    df['intent'] = df['intent'].astype(str).str.strip()

    # Check empty strings
    empty_mask = df['text_clean'] == ""
    if empty_mask.sum() > 0:
        print(f"Removing {empty_mask.sum()} empty text rows.")
        df = df[~empty_mask].copy()

    # Check duplicates
    total_dups = df.duplicated(subset=['text_clean']).sum()
    print(f"Duplicate text occurrences: {total_dups}")

    # Class distribution
    intent_counts = df['intent'].value_counts()
    unique_intents = sorted(intent_counts.index.tolist())
    print(f"Number of unique intents: {len(unique_intents)}")
    print("\nClass Distribution:")
    for intent, count in intent_counts.items():
        print(f"  - {intent:<20}: {count} examples")

    return df, unique_intents


def create_candidate_models():
    """Define candidate ML pipelines with hybrid word + char_wb FeatureUnion for extreme typo and variation tolerance."""
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
        "ComplementNB": Pipeline([
            ("tfidf", hybrid_vectorizer),
            ("clf", ComplementNB(alpha=0.1))
        ])
    }
    return candidates


def evaluate_candidate_models(candidates, X_train, X_test, y_train, y_test, labels):
    """Train each candidate model and compute performance metrics."""
    print(f"\n" + "=" * 60)
    print(f"2. MODEL TRAINING & BENCHMARKING")
    print(f"=" * 60)

    results = {}
    reports = {}
    conf_matrices = {}

    for name, pipeline in candidates.items():
        print(f"Training {name}...")
        pipeline.fit(X_train, y_train)
        y_pred = pipeline.predict(X_test)

        acc = accuracy_score(y_test, y_pred)
        prec_macro = precision_score(y_test, y_pred, average='macro', zero_division=0)
        rec_macro = recall_score(y_test, y_pred, average='macro', zero_division=0)
        f1_macro = f1_score(y_test, y_pred, average='macro', zero_division=0)
        f1_weighted = f1_score(y_test, y_pred, average='weighted', zero_division=0)

        results[name] = {
            "Accuracy": acc,
            "Precision (Macro)": prec_macro,
            "Recall (Macro)": rec_macro,
            "Macro F1": f1_macro,
            "Weighted F1": f1_weighted,
            "Pipeline": pipeline
        }
        reports[name] = classification_report(y_test, y_pred, labels=labels, zero_division=0)
        conf_matrices[name] = confusion_matrix(y_test, y_pred, labels=labels)

    # Print summary table
    print("\n" + "-" * 75)
    print(f"{'Model':<25} {'Accuracy':<10} {'Precision(M)':<14} {'Recall(M)':<12} {'Macro F1':<10}")
    print("-" * 75)
    for name, res in results.items():
        print(f"{name:<25} {res['Accuracy']:<10.4f} {res['Precision (Macro)']:<14.4f} {res['Recall (Macro)']:<12.4f} {res['Macro F1']:<10.4f}")
    print("-" * 75)

    # Best model selection based on Macro F1
    best_name = max(results.keys(), key=lambda k: (results[k]["Macro F1"], results[k]["Accuracy"]))
    print(f"\n>>> Best Model Selected: {best_name} (Macro F1 = {results[best_name]['Macro F1']:.4f})")

    return results, best_name, reports, conf_matrices


def perform_error_analysis(pipeline, X_test, y_test, raw_texts):
    """Analyze and display misclassified test examples."""
    print(f"\n" + "=" * 60)
    print(f"3. ERROR ANALYSIS (Best Model)")
    print(f"=" * 60)

    y_pred = pipeline.predict(X_test)
    y_test_arr = np.array(y_test)
    raw_texts_arr = np.array(raw_texts)

    misclassified_idx = np.where(y_test_arr != y_pred)[0]
    print(f"Total misclassifications on test set: {len(misclassified_idx)} / {len(y_test)} (Error rate: {len(misclassified_idx)/len(y_test)*100:.2f}%)")

    if len(misclassified_idx) > 0:
        print("\nSample Misclassified Examples:")
        print(f"{'Input Text':<40} | {'Actual Intent':<18} | {'Predicted Intent':<18}")
        print("-" * 82)
        for idx in misclassified_idx[:15]:
            text_snippet = raw_texts_arr[idx][:38]
            print(f"{text_snippet:<40} | {y_test_arr[idx]:<18} | {y_pred[idx]:<18}")
    else:
        print("Outstanding! 0 misclassifications on the test set.")

    return misclassified_idx


def plot_and_save_confusion_matrix(cm, labels, output_path):
    """Save confusion matrix heatmap."""
    plt.figure(figsize=(14, 12))
    sns.heatmap(
        cm,
        annot=True,
        fmt='d',
        cmap='Blues',
        xticklabels=labels,
        yticklabels=labels,
        cbar=True
    )
    plt.title('Confusion Matrix - Intent Classification (Test Set)', fontsize=14, pad=12)
    plt.xlabel('Predicted Intent', fontsize=12)
    plt.ylabel('Actual Intent', fontsize=12)
    plt.xticks(rotation=45, ha='right', fontsize=9)
    plt.yticks(rotation=0, fontsize=9)
    plt.tight_layout()
    plt.savefig(output_path, dpi=300)
    plt.close()
    print(f"Confusion matrix plot saved to: {output_path}")


def save_model_and_metadata(best_name, best_pipeline, results, unique_intents, total_examples, output_dir):
    """Serialize the trained pipeline and metadata JSON."""
    os.makedirs(output_dir, exist_ok=True)
    model_path = os.path.join(output_dir, "chatbot_intent_model.pkl")
    meta_path = os.path.join(output_dir, "model_metadata.json")

    # Save pipeline
    joblib.dump(best_pipeline, model_path)
    print(f"Model saved to: {model_path}")

    # Build metadata
    best_metrics = results[best_name]
    metadata = {
        "model_name": best_name,
        "training_timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat(),
        "total_examples": total_examples,
        "num_intents": len(unique_intents),
        "intents": unique_intents,
        "confidence_threshold": CONFIDENCE_THRESHOLD,
        "evaluation_metrics": {
            "accuracy": round(float(best_metrics["Accuracy"]), 4),
            "precision_macro": round(float(best_metrics["Precision (Macro)"]), 4),
            "recall_macro": round(float(best_metrics["Recall (Macro)"]), 4),
            "macro_f1": round(float(best_metrics["Macro F1"]), 4),
            "weighted_f1": round(float(best_metrics["Weighted F1"]), 4)
        },
        "all_model_benchmarks": {
            k: {
                "accuracy": round(float(v["Accuracy"]), 4),
                "macro_f1": round(float(v["Macro F1"]), 4),
                "weighted_f1": round(float(v["Weighted F1"]), 4)
            } for k, v in results.items()
        }
    }

    with open(meta_path, "w", encoding="utf-8") as f:
        json.dump(metadata, f, indent=2)
    print(f"Metadata saved to: {meta_path}")

    return model_path, meta_path


def train_pipeline(data_path=None, output_dir=None):
    """Execute end-to-end training pipeline."""
    csv_path = resolve_data_path(data_path)
    if output_dir is None:
        output_dir = os.path.join(os.path.dirname(__file__), "models")

    df, unique_intents = load_and_inspect_dataset(csv_path)

    # Train/Test Split (Stratified 80/20)
    X = df['text_clean']
    y = df['intent']
    raw_texts = df['text'].tolist()

    X_train, X_test, y_train, y_test, train_idx, test_idx = train_test_split(
        X, y, df.index, test_size=0.20, stratify=y, random_state=42
    )
    raw_texts_test = [raw_texts[i] for i in test_idx]

    print(f"\nTrain set: {len(X_train)} samples")
    print(f"Test set:  {len(X_test)} samples")

    # Model training & benchmarking
    candidates = create_candidate_models()
    results, best_name, reports, conf_matrices = evaluate_candidate_models(
        candidates, X_train, X_test, y_train, y_test, unique_intents
    )

    # Error analysis
    best_pipeline = results[best_name]["Pipeline"]
    perform_error_analysis(best_pipeline, X_test, y_test, raw_texts_test)

    # Classification Report
    print(f"\nDetailed Classification Report for {best_name}:\n")
    print(reports[best_name])

    # Confusion matrix plot
    cm_path = os.path.join(output_dir, "confusion_matrix.png")
    os.makedirs(output_dir, exist_ok=True)
    plot_and_save_confusion_matrix(conf_matrices[best_name], unique_intents, cm_path)

    # Save model and metadata
    model_path, meta_path = save_model_and_metadata(
        best_name, best_pipeline, results, unique_intents, len(df), output_dir
    )

    print(f"\n" + "=" * 60)
    print(f"TRAINING COMPLETE SUCCESSFULLY")
    print(f"=" * 60)
    return best_pipeline, best_name, results


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Train ML Intent Classification Model")
    parser.add_argument("--data", type=str, default=None, help="Path to training CSV file")
    parser.add_argument("--output_dir", type=str, default=None, help="Directory to save models")
    args = parser.parse_args()

    train_pipeline(args.data, args.output_dir)
