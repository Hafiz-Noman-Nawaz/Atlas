"""
Programmatic API Interface for ML Intent Prediction
Provides pure machine-readable JSON output for Node.js backend.
Supports single-shot prediction as well as high-performance persistent daemon mode.
"""

import sys
import os
import json
import argparse

# Ensure ml directory is in python path
current_dir = os.path.dirname(os.path.abspath(__file__))
if current_dir not in sys.path:
    sys.path.insert(0, current_dir)

from predict import IntentPredictor

def run_daemon(threshold=None):
    """
    High-performance persistent daemon mode.
    Keeps the ML model loaded in memory and reads line-delimited JSON requests from stdin.
    """
    predictor = IntentPredictor(threshold=threshold)
    # Signal readiness to parent Node.js process
    sys.stdout.write(json.dumps({"status": "ready"}) + "\n")
    sys.stdout.flush()

    while True:
        try:
            line = sys.stdin.readline()
            if not line:
                break
            
            line_str = line.strip()
            if not line_str:
                continue

            req_id = None
            text = ""
            thresh = threshold

            try:
                data = json.loads(line_str)
                req_id = data.get("id")
                text = data.get("text", "")
                if "threshold" in data and data["threshold"] is not None:
                    thresh = float(data["threshold"])
            except Exception:
                text = line_str

            result = predictor.predict_intent(text, threshold=thresh)
            if req_id is not None:
                result["id"] = req_id

            sys.stdout.write(json.dumps(result, ensure_ascii=False) + "\n")
            sys.stdout.flush()
        except (KeyboardInterrupt, EOFError):
            break
        except Exception as e:
            err_payload = {
                "id": req_id,
                "intent": "unknown",
                "confidence": 0.0,
                "error": str(e),
                "is_confident": False,
                "top_predictions": []
            }
            sys.stdout.write(json.dumps(err_payload, ensure_ascii=False) + "\n")
            sys.stdout.flush()


def main():
    parser = argparse.ArgumentParser(description="Programmatic JSON Predictor")
    parser.add_argument("text", nargs="?", type=str, default=None, help="User input text")
    parser.add_argument("--threshold", type=float, default=None, help="Confidence threshold")
    parser.add_argument("--stdin", action="store_true", help="Read input text from standard input")
    parser.add_argument("--daemon", action="store_true", help="Run in continuous line-delimited daemon mode")
    args = parser.parse_args()

    if args.daemon:
        run_daemon(threshold=args.threshold)
        return

    input_text = ""
    if args.stdin:
        input_text = sys.stdin.read().strip()
    elif args.text is not None:
        input_text = args.text
    else:
        input_text = ""

    try:
        predictor = IntentPredictor(threshold=args.threshold)
        result = predictor.predict_intent(input_text, threshold=args.threshold)
        
        sys.stdout.write(json.dumps(result, ensure_ascii=False) + "\n")
        sys.stdout.flush()
        sys.exit(0)
    except Exception as e:
        error_payload = {
            "intent": "unknown",
            "confidence": 0.0,
            "error": str(e),
            "is_confident": False,
            "top_predictions": []
        }
        sys.stdout.write(json.dumps(error_payload, ensure_ascii=False) + "\n")
        sys.stdout.flush()
        sys.exit(1)


if __name__ == "__main__":
    main()
