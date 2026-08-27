import os
import joblib
import pandas as pd
from sklearn.pipeline import Pipeline, FeatureUnion
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.svm import LinearSVC
from sklearn.calibration import CalibratedClassifierCV
from data.build_master_dataset import build_master_dataset

def run():
    current_dir = os.path.dirname(os.path.abspath(__file__))
    data_path = os.path.join(current_dir, "data", "chatbot_training_data.csv")
    df = build_master_dataset(data_path, target_samples_per_intent=160)
    print(f"Master dataset: {len(df)} rows across {df['intent'].nunique()} intents.")

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

    pipeline = Pipeline([
        ("tfidf", hybrid_vectorizer),
        ("clf", CalibratedClassifierCV(LinearSVC(C=1.0, random_state=42), cv=5))
    ])

    print("Training pipeline...")
    pipeline.fit(df["text"], df["intent"])

    save_path = os.path.join(current_dir, "models", "chatbot_intent_model.pkl")
    os.makedirs(os.path.dirname(save_path), exist_ok=True)
    joblib.dump(pipeline, save_path)
    print(f"[OK] Saved model to: {save_path}")

    # Test sample queries
    test_queries = [
        "write a jawascript code which uses event listener to change the color of the box",
        "write a python code for prime numbers",
        "My name is noman",
        "what is my name?",
        "Write an efficient JavaScript algorithm to find the longest substring",
        "How to undo last git commit?",
        "asdfghjkl"
    ]

    print("\n--- Model Verification ---")
    for q in test_queries:
        probs = pipeline.predict_proba([q])[0]
        top_intent, top_score = sorted(zip(pipeline.classes_, probs), key=lambda x: x[1], reverse=True)[0]
        print(f'"{q[:45]}..." -> {top_intent} ({top_score * 100:.1f}%)')

if __name__ == "__main__":
    run()
