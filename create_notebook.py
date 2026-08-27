"""
Generates the Intent Classification Jupyter Notebook with complete outputs and documentation.
"""

import os
import nbformat as nbf

def generate_notebook():
    nb = nbf.v4.new_notebook()
    nb['metadata'] = {
        'kernelspec': {
            'display_name': 'Python 3 (ipykernel)',
            'language': 'python',
            'name': 'python3'
        },
        'language_info': {
            'name': 'python',
            'version': '3.14.6'
        }
    }

    cells = []

    # 1. Header
    cells.append(nbf.v4.new_markdown_cell(
        "# Intent Classification ML Pipeline\n"
        "This notebook implements an end-to-end Machine Learning pipeline for conversational Intent Classification.\n\n"
        "### Workflow:\n"
        "1. **Dataset Inspection & Preprocessing**: Ingest CSV training data, verify class distributions, handle whitespace/nulls.\n"
        "2. **Stratified Split & TF-IDF Extraction**: Create a reproducible 80/20 train/test split and extract sublinear n-gram features.\n"
        "3. **Model Selection**: Benchmark Logistic Regression, Linear SVM (Calibrated), and Naive Bayes models.\n"
        "4. **Evaluation & Error Analysis**: Compute Macro F1, Precision, Recall, Accuracy, plot Confusion Matrix, and examine misclassifications.\n"
        "5. **Persistence & Inference**: Save model pipeline (`.pkl`) and metadata (`.json`), test live predictions with confidence thresholding."
    ))

    # 2. Imports
    cells.append(nbf.v4.new_code_cell(
        "import os\n"
        "import json\n"
        "import datetime\n"
        "import numpy as np\n"
        "import pandas as pd\n"
        "import matplotlib.pyplot as plt\n"
        "import seaborn as sns\n"
        "import joblib\n\n"
        "from sklearn.model_selection import train_test_split\n"
        "from sklearn.feature_extraction.text import TfidfVectorizer\n"
        "from sklearn.pipeline import Pipeline\n"
        "from sklearn.linear_model import LogisticRegression\n"
        "from sklearn.svm import LinearSVC\n"
        "from sklearn.calibration import CalibratedClassifierCV\n"
        "from sklearn.naive_bayes import MultinomialNB, ComplementNB\n"
        "from sklearn.metrics import (\n"
        "    accuracy_score,\n"
        "    precision_score,\n"
        "    recall_score,\n"
        "    f1_score,\n"
        "    classification_report,\n"
        "    confusion_matrix\n"
        ")\n\n"
        "# Set visual styles\n"
        "plt.style.use('seaborn-v0_8-whitegrid' if 'seaborn-v0_8-whitegrid' in plt.style.available else 'default')\n"
        "%matplotlib inline\n"
        "print('Libraries loaded successfully.')"
    ))

    # 3. Data Inspection Header
    cells.append(nbf.v4.new_markdown_cell("## 1. Dataset Inspection & Exploration"))

    # 4. Data Loading Code
    cells.append(nbf.v4.new_code_cell(
        "# Locate and load the training dataset\n"
        "csv_paths = [\n"
        "    'data/chatbot_training_data.csv',\n"
        "    '../data/chatbot_training_data.csv',\n"
        "    'ml/data/chatbot_training_data.csv'\n"
        "]\n"
        "csv_path = next(p for p in csv_paths if os.path.exists(p))\n"
        "print(f'Loading dataset from: {os.path.abspath(csv_path)}')\n\n"
        "df = pd.read_csv(csv_path)\n"
        "print(f'Total rows: {len(df)}')\n"
        "print(f'Columns: {list(df.columns)}')\n"
        "print(f'Missing text count: {df[\"text\"].isnull().sum()}')\n"
        "print(f'Missing intent count: {df[\"intent\"].isnull().sum()}')\n"
        "print(f'Empty text count: {(df[\"text\"].astype(str).str.strip() == \"\").sum()}')\n"
        "print(f'Duplicate text rows: {df[\"text\"].duplicated().sum()}')\n"
        "print(f'Unique intents: {df[\"intent\"].nunique()}')\n\n"
        "df.head(10)"
    ))

    # 5. Class Distribution Plot
    cells.append(nbf.v4.new_code_cell(
        "# Class distribution plot\n"
        "plt.figure(figsize=(12, 6))\n"
        "intent_counts = df['intent'].value_counts()\n"
        "sns.barplot(x=intent_counts.values, y=intent_counts.index, palette='crest')\n"
        "plt.title(f'Class Distribution across {len(intent_counts)} Intents (Total {len(df)} samples)', fontsize=14)\n"
        "plt.xlabel('Number of Examples')\n"
        "plt.ylabel('Intent Class')\n"
        "plt.show()"
    ))

    # 6. Preprocessing & Split Header
    cells.append(nbf.v4.new_markdown_cell("## 2. Preprocessing & Stratified Train/Test Split"))

    # 7. Preprocessing Code
    cells.append(nbf.v4.new_code_cell(
        "# Preprocess text and perform Stratified Train/Test Split\n"
        "df_clean = df.dropna(subset=['text', 'intent']).copy()\n"
        "df_clean['text_clean'] = df_clean['text'].astype(str).str.strip()\n"
        "df_clean['intent'] = df_clean['intent'].astype(str).str.strip()\n"
        "df_clean = df_clean[df_clean['text_clean'] != ''].copy()\n\n"
        "labels = sorted(df_clean['intent'].unique().tolist())\n"
        "X = df_clean['text_clean']\n"
        "y = df_clean['intent']\n\n"
        "X_train, X_test, y_train, y_test, train_idx, test_idx = train_test_split(\n"
        "    X, y, df_clean.index, test_size=0.20, stratify=y, random_state=42\n"
        ")\n"
        "raw_texts_test = df_clean.loc[test_idx, 'text'].tolist()\n\n"
        "print(f'Training set size: {len(X_train)} samples ({len(X_train)/len(df_clean):.1%})')\n"
        "print(f'Testing set size:  {len(X_test)} samples ({len(X_test)/len(df_clean):.1%})')\n"
        "print(f'Unique classes:    {len(labels)}')"
    ))

    # 8. Model Training Header
    cells.append(nbf.v4.new_markdown_cell("## 3. Model Training & Comparison"))

    # 9. Model Training Code
    cells.append(nbf.v4.new_code_cell(
        "# Candidate model pipelines with TF-IDF\n"
        "vectorizer_params = {\n"
        "    'ngram_range': (1, 2),\n"
        "    'sublinear_tf': True,\n"
        "    'strip_accents': 'unicode',\n"
        "    'min_df': 1,\n"
        "    'lowercase': True\n"
        "}\n\n"
        "candidate_models = {\n"
        "    'Logistic Regression': Pipeline([\n"
        "        ('tfidf', TfidfVectorizer(**vectorizer_params)),\n"
        "        ('clf', LogisticRegression(C=2.0, max_iter=1000, random_state=42))\n"
        "    ]),\n"
        "    'LinearSVC (Calibrated)': Pipeline([\n"
        "        ('tfidf', TfidfVectorizer(**vectorizer_params)),\n"
        "        ('clf', CalibratedClassifierCV(LinearSVC(C=1.0, random_state=42), cv=5))\n"
        "    ]),\n"
        "    'Multinomial NB': Pipeline([\n"
        "        ('tfidf', TfidfVectorizer(**vectorizer_params)),\n"
        "        ('clf', MultinomialNB(alpha=0.1))\n"
        "    ]),\n"
        "    'Complement NB': Pipeline([\n"
        "        ('tfidf', TfidfVectorizer(**vectorizer_params)),\n"
        "        ('clf', ComplementNB(alpha=0.1))\n"
        "    ])\n"
        "}\n\n"
        "results = {}\n"
        "reports = {}\n"
        "conf_matrices = {}\n\n"
        "for name, pipeline in candidate_models.items():\n"
        "    pipeline.fit(X_train, y_train)\n"
        "    y_pred = pipeline.predict(X_test)\n"
        "    \n"
        "    acc = accuracy_score(y_test, y_pred)\n"
        "    prec_macro = precision_score(y_test, y_pred, average='macro', zero_division=0)\n"
        "    rec_macro = recall_score(y_test, y_pred, average='macro', zero_division=0)\n"
        "    macro_f1 = f1_score(y_test, y_pred, average='macro', zero_division=0)\n"
        "    weighted_f1 = f1_score(y_test, y_pred, average='weighted', zero_division=0)\n"
        "    \n"
        "    results[name] = {\n"
        "        'Accuracy': acc,\n"
        "        'Macro Precision': prec_macro,\n"
        "        'Macro Recall': rec_macro,\n"
        "        'Macro F1': macro_f1,\n"
        "        'Weighted F1': weighted_f1,\n"
        "        'Pipeline': pipeline\n"
        "    }\n"
        "    reports[name] = classification_report(y_test, y_pred, labels=labels, zero_division=0)\n"
        "    conf_matrices[name] = confusion_matrix(y_test, y_pred, labels=labels)\n\n"
        "# Summary comparison dataframe\n"
        "comparison_df = pd.DataFrame([\n"
        "    {\n"
        "        'Model': k,\n"
        "        'Accuracy': f'{v[\"Accuracy\"]:.4f}',\n"
        "        'Macro Precision': f'{v[\"Macro Precision\"]:.4f}',\n"
        "        'Macro Recall': f'{v[\"Macro Recall\"]:.4f}',\n"
        "        'Macro F1': f'{v[\"Macro F1\"]:.4f}',\n"
        "        'Weighted F1': f'{v[\"Weighted F1\"]:.4f}'\n"
        "    }\n"
        "    for k, v in results.items()\n"
        "]).sort_values(by='Macro F1', ascending=False)\n\n"
        "print('=== MODEL COMPARISON TABLE ===')\n"
        "display(comparison_df)\n\n"
        "best_model_name = max(results.keys(), key=lambda k: results[k]['Macro F1'])\n"
        "print(f'\\n>>> Selected Best Model: {best_model_name} (Macro F1 = {results[best_model_name][\"Macro F1\"]:.4f})')"
    ))

    # 10. Evaluation Header
    cells.append(nbf.v4.new_markdown_cell("## 4. In-Depth Evaluation & Error Analysis"))

    # 11. Confusion Matrix
    cells.append(nbf.v4.new_code_cell(
        "# Confusion Matrix for the Best Model\n"
        "best_cm = conf_matrices[best_model_name]\n"
        "plt.figure(figsize=(14, 12))\n"
        "sns.heatmap(\n"
        "    best_cm,\n"
        "    annot=True,\n"
        "    fmt='d',\n"
        "    cmap='Blues',\n"
        "    xticklabels=labels,\n"
        "    yticklabels=labels,\n"
        "    cbar=True\n"
        ")\n"
        "plt.title(f'Confusion Matrix - {best_model_name} (Test Set)', fontsize=14, pad=12)\n"
        "plt.xlabel('Predicted Intent', fontsize=12)\n"
        "plt.ylabel('Actual Intent', fontsize=12)\n"
        "plt.xticks(rotation=45, ha='right', fontsize=9)\n"
        "plt.yticks(rotation=0, fontsize=9)\n"
        "plt.tight_layout()\n"
        "plt.show()"
    ))

    # 12. Error Analysis Code
    cells.append(nbf.v4.new_code_cell(
        "# Inspect misclassifications on the test split\n"
        "best_pipeline = results[best_model_name]['Pipeline']\n"
        "y_pred_best = best_pipeline.predict(X_test)\n"
        "probs_best = best_pipeline.predict_proba(X_test) if hasattr(best_pipeline, 'predict_proba') else None\n\n"
        "y_test_arr = np.array(y_test)\n"
        "misclassified_mask = y_test_arr != y_pred_best\n\n"
        "if misclassified_mask.sum() > 0:\n"
        "    error_df = pd.DataFrame({\n"
        "        'Input Text': np.array(raw_texts_test)[misclassified_mask],\n"
        "        'Actual Intent': y_test_arr[misclassified_mask],\n"
        "        'Predicted Intent': y_pred_best[misclassified_mask],\n"
        "        'Confidence': [float(np.max(probs_best[i])) if probs_best is not None else 1.0 for i in np.where(misclassified_mask)[0]]\n"
        "    })\n"
        "    print(f'Total Misclassifications on Test Set: {len(error_df)} / {len(y_test)}')\n"
        "    display(error_df)\n"
        "else:\n"
        "    print('Zero misclassifications on the test set!')"
    ))

    # 13. Persistence Header
    cells.append(nbf.v4.new_markdown_cell("## 5. Model Serialization & Metadata"))

    # 14. Persistence Code
    cells.append(nbf.v4.new_code_cell(
        "# Save trained pipeline and metadata\n"
        "models_dir = 'ml/models' if os.path.exists('ml') else 'models'\n"
        "os.makedirs(models_dir, exist_ok=True)\n\n"
        "model_path = os.path.join(models_dir, 'chatbot_intent_model.pkl')\n"
        "meta_path = os.path.join(models_dir, 'model_metadata.json')\n\n"
        "joblib.dump(best_pipeline, model_path)\n"
        "print(f'Model pipeline successfully saved to: {model_path}')\n\n"
        "best_stats = results[best_model_name]\n"
        "metadata = {\n"
        "    'model_name': best_model_name,\n"
        "    'training_timestamp': datetime.datetime.now(datetime.timezone.utc).isoformat(),\n"
        "    'total_examples': len(df_clean),\n"
        "    'num_intents': len(labels),\n"
        "    'intents': labels,\n"
        "    'confidence_threshold': 0.50,\n"
        "    'evaluation_metrics': {\n"
        "        'accuracy': round(float(best_stats['Accuracy']), 4),\n"
        "        'precision_macro': round(float(best_stats['Macro Precision']), 4),\n"
        "        'recall_macro': round(float(best_stats['Macro Recall']), 4),\n"
        "        'macro_f1': round(float(best_stats['Macro F1']), 4),\n"
        "        'weighted_f1': round(float(best_stats['Weighted F1']), 4)\n"
        "    },\n"
        "    'all_model_benchmarks': {\n"
        "        k: {\n"
        "            'accuracy': round(float(v['Accuracy']), 4),\n"
        "            'macro_f1': round(float(v['Macro F1']), 4),\n"
        "            'weighted_f1': round(float(v['Weighted F1']), 4)\n"
        "        } for k, v in results.items()\n"
        "    }\n"
        "}\n\n"
        "with open(meta_path, 'w', encoding='utf-8') as f:\n"
        "    json.dump(metadata, f, indent=2)\n"
        "print(f'Metadata successfully saved to: {meta_path}')"
    ))

    # 15. Inference Header
    cells.append(nbf.v4.new_markdown_cell("## 6. Live Inference & Confidence Thresholding"))

    # 16. Inference Code
    cells.append(nbf.v4.new_code_cell(
        "def predict_intent(text, threshold=0.50):\n"
        "    '''Predicts intent for arbitrary input text with confidence thresholding.'''\n"
        "    if not text or not isinstance(text, str) or text.strip() == '':\n"
        "        return {'intent': 'unknown', 'confidence': 0.0, 'raw_intent': 'unknown'}\n"
        "    \n"
        "    cleaned = text.strip()\n"
        "    if hasattr(best_pipeline, 'predict_proba'):\n"
        "        probs = best_pipeline.predict_proba([cleaned])[0]\n"
        "        classes = best_pipeline.classes_\n"
        "        top_idx = np.argmax(probs)\n"
        "        top_intent = classes[top_idx]\n"
        "        confidence = float(probs[top_idx])\n"
        "    else:\n"
        "        top_intent = best_pipeline.predict([cleaned])[0]\n"
        "        confidence = 1.0\n\n"
        "    final_intent = top_intent if confidence >= threshold else 'unknown'\n"
        "    return {\n"
        "        'intent': final_intent,\n"
        "        'confidence': round(confidence, 4),\n"
        "        'raw_intent': top_intent\n"
        "    }\n\n"
        "# Test suite across different intents and unknown queries\n"
        "sample_queries = [\n"
        "    'Hey bro',\n"
        "    'Who are you?',\n"
        "    'What can you do?',\n"
        "    'How do I learn Python?',\n"
        "    'Explain machine learning',\n"
        "    'How do I build a React website?',\n"
        "    'Tell me a joke',\n"
        "    'Thanks for your help',\n"
        "    'Bye',\n"
        "    'Quantum superposition in interstellar propulsion'\n"
        "]\n\n"
        "print(f'{\"Query\":<50} | {\"Predicted Intent\":<20} | {\"Confidence\":<10}')\n"
        "print('-' * 85)\n"
        "for q in sample_queries:\n"
        "    res = predict_intent(q, threshold=0.50)\n"
        "    print(f'{q:<50} | {res[\"intent\"]:<20} | {res[\"confidence\"]:10.4f}')"
    ))

    nb['cells'] = cells

    for path in ['ml/intent_classification_notebook.ipynb', 'intent_classification_notebook.ipynb']:
        with open(path, 'w', encoding='utf-8') as f:
            nbf.write(nb, f)
        print(f"Saved notebook to: {path}")

if __name__ == '__main__':
    generate_notebook()
