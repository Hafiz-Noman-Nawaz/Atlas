# Atlas Chatbot - ML Intent Classification

This directory contains the ML Intent Classification training pipeline, evaluation suite, saved models, and inference API for the Atlas Chatbot.

---

## 📁 Directory Structure

```text
ml/
├── data/
│   └── chatbot_training_data.csv       # Training dataset (2,625 examples, 25 intents)
├── models/
│   ├── chatbot_intent_model.pkl        # Serialized pipeline (TF-IDF + Calibrated LinearSVC)
│   ├── model_metadata.json             # Model metrics, intent list, and threshold config
│   └── confusion_matrix.png            # Visualized confusion matrix heatmap
├── train.py                            # Training pipeline & model benchmark script
├── evaluate.py                         # In-depth test evaluation & error analysis
├── predict.py                          # Inference script with confidence thresholding
├── intent_classification_notebook.ipynb# Executed Jupyter Notebook (Base Python kernel)
├── requirements.txt                    # Minimal Python dependencies
└── README.md                           # Documentation & backend integration guide
```

---

## 📊 Dataset Summary

* **Source File**: `ml/data/chatbot_training_data.csv` (and `data/chatbot_training_data.csv`)
* **Total Examples**: 2,625 rows
* **Unique Intents**: 25 classes (balanced with exactly 105 examples per intent)
* **Columns**: `text`, `intent`
* **Data Quality**:
  * Missing Values: 0
  * Empty Text Strings: 0
  * Duplicate Text Entries: 75 occurrences handled cleanly in preprocessing.
  * Cross-intent conflict: 1 phrase (`"how do you do?"` appearing in `how_are_you` and `greeting`).

### Intent Classes
`age`, `bot_identity`, `capabilities`, `contact`, `creator`, `data_science`, `goodbye`, `greeting`, `help`, `how_are_you`, `javascript`, `jokes`, `machine_learning`, `motivation`, `name`, `negative_feedback`, `positive_feedback`, `programming`, `python`, `study_help`, `thanks`, `time`, `unknown`, `weather`, `web_development`.

---

## 🏆 Model Benchmarking & Performance

Candidate classifiers were trained with TF-IDF `(ngram_range=(1, 2), sublinear_tf=True)` on a stratified 80/20 train/test split:

| Model | Accuracy | Macro Precision | Macro Recall | Macro F1 |
| :--- | :--- | :--- | :--- | :--- |
| **LinearSVC (Calibrated)** ⭐ | **0.8438** | **0.8570** | **0.8438** | **0.8427** |
| Logistic Regression | 0.8305 | 0.8474 | 0.8305 | 0.8295 |
| Multinomial Naive Bayes | 0.8210 | 0.8343 | 0.8210 | 0.8195 |
| Complement Naive Bayes | 0.8190 | 0.8273 | 0.8190 | 0.8165 |

**Selected Model**: **`LinearSVC (Calibrated)`**
* Achieved highest Macro F1 (**0.8427**) and Accuracy (**84.38%**).
* Uses 5-fold cross-validation calibration (`CalibratedClassifierCV`) to generate well-calibrated posterior probabilities `predict_proba()` for confidence thresholding.

---

## 🚀 Quickstart & Commands

### 1. Install Dependencies
```bash
pip install -r ml/requirements.txt
```

### 2. Retrain the Model (when dataset is updated/expanded)
Simply replace or update `data/chatbot_training_data.csv` (or `ml/data/chatbot_training_data.csv`) and run:
```bash
python ml/train.py
```
Or specify a custom CSV path:
```bash
python ml/train.py --data "path/to/new_dataset.csv"
```

### 3. Evaluate Model & Error Analysis
```bash
python ml/evaluate.py
```

### 4. Test Intent Prediction
**Run Automated Test Suite:**
```bash
python ml/predict.py --test_suite
```

**Predict Single Input (Human Readable):**
```bash
python ml/predict.py "How do I build a React website?"
```

**Predict Single Input (JSON Format for Backend / Scripts):**
```bash
python ml/predict.py "How do I build a React website?" --json
```
Output:
```json
{
  "intent": "web_development",
  "confidence": 0.7871,
  "raw_intent": "web_development",
  "is_confident": true,
  "top_predictions": [
    {
      "intent": "web_development",
      "confidence": 0.7871
    },
    {
      "intent": "programming",
      "confidence": 0.0544
    },
    {
      "intent": "motivation",
      "confidence": 0.0403
    }
  ]
}
```

**Predict with Custom Confidence Threshold:**
```bash
python ml/predict.py "Can you teach me some React tricks?" --threshold 0.60 --json
```

**Interactive REPL Mode:**
```bash
python ml/predict.py
```

---

## 🔗 Next Step: Node.js + Express Integration

When ready to integrate with the Node.js backend, there are two standard options:

### Option A: Lightweight Microservice / Subprocess (Recommended)
Spawn a small Python worker or FastAPI/Flask endpoint, or invoke `predict.py` via Node.js `child_process.spawn`:

```javascript
// Example Node.js Express integration
const { spawn } = require('child_process');

function getBotIntent(userMessage) {
  return new Promise((resolve, reject) => {
    const pyProcess = spawn('python', ['ml/predict.py', userMessage, '--json']);
    let dataString = '';

    pyProcess.stdout.on('data', (data) => {
      dataString += data.toString();
    });

    pyProcess.on('close', (code) => {
      if (code === 0) {
        try {
          const result = JSON.parse(dataString);
          resolve(result); // { intent: 'greeting', confidence: 0.8931, ... }
        } catch (err) {
          reject(err);
        }
      } else {
        reject(new Error(`Inference failed with code ${code}`));
      }
    });
  });
}
```

### Option B: Microservice HTTP Endpoint
Run a lightweight FastAPI/Flask microservice exposing:
* `POST /api/intent` -> Body: `{"text": "Hey there"}`
* Returns: `{"intent": "greeting", "confidence": 0.8931}`
