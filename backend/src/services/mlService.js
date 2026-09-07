import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import readline from 'readline';

/**
 * Resolves the path to the Python predict_api.py script.
 */
function resolvePredictScriptPath() {
  const candidates = [
    path.join(process.cwd(), '..', 'ml', 'predict_api.py'),
    path.join(process.cwd(), 'ml', 'predict_api.py'),
    path.join(process.cwd(), '..', 'ml', 'predict.py'),
    path.join(process.cwd(), 'ml', 'predict.py'),
  ];

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      return path.resolve(candidate);
    }
  }

  return path.resolve(path.join(process.cwd(), '..', 'ml', 'predict_api.py'));
}

function isPythonAvailable() {
  if (process.env.VERCEL) return false;
  try {
    const scriptPath = resolvePredictScriptPath();
    return fs.existsSync(scriptPath);
  } catch {
    return false;
  }
}

class PythonMLWorker {
  constructor() {
    this.process = null;
    this.rl = null;
    this.pendingRequests = new Map();
    this.nextReqId = 1;
    this.isReady = false;
    this.initPromise = null;
  }

  init() {
    if (!isPythonAvailable()) {
      return Promise.resolve(false);
    }

    if (this.initPromise) return this.initPromise;

    this.initPromise = new Promise((resolve) => {
      const pythonPath = process.env.PYTHON_PATH || 'python';
      const scriptPath = resolvePredictScriptPath();
      const threshold = process.env.ML_CONFIDENCE_THRESHOLD || '0.60';

      this.process = spawn(
        pythonPath,
        [scriptPath, '--threshold', threshold.toString(), '--daemon'],
        {
          stdio: ['pipe', 'pipe', 'pipe'],
          cwd: path.dirname(scriptPath),
        }
      );

      this.rl = readline.createInterface({
        input: this.process.stdout,
        crlfDelay: Infinity,
      });

      this.rl.on('line', (line) => {
        try {
          const data = JSON.parse(line.trim());
          if (data.status === 'ready') {
            this.isReady = true;
            console.log('[ML Service] 🧠 Python ML Intent Classifier worker ready.');
            resolve(true);
            return;
          }

          const reqId = data.id;
          if (reqId && this.pendingRequests.has(reqId)) {
            const { resolve: reqResolve, timer } = this.pendingRequests.get(reqId);
            clearTimeout(timer);
            this.pendingRequests.delete(reqId);
            reqResolve(data);
          }
        } catch (err) {
          console.warn('[ML Service] Unparseable worker line:', line, err.message);
        }
      });

      this.process.stderr.on('data', (data) => {
        const str = data.toString().trim();
        if (str) {
          console.warn('[ML Service Python Stderr]', str);
        }
      });

      this.process.on('close', (code) => {
        console.warn(`[ML Service] Python worker exited with code ${code}. Cleaning up.`);
        this.isReady = false;
        this.process = null;
        this.rl = null;
        this.initPromise = null;

        // Reject all pending requests
        for (const [id, req] of this.pendingRequests.entries()) {
          clearTimeout(req.timer);
          req.resolve({
            id,
            intent: 'unknown',
            confidence: 0.0,
            raw_intent: 'unknown',
            is_confident: false,
            top_predictions: [],
          });
        }
        this.pendingRequests.clear();
      });

      this.process.on('error', (err) => {
        console.error('[ML Service] Failed to spawn Python worker:', err.message);
        this.isReady = false;
        this.initPromise = null;
        resolve(false);
      });

      // Timeout fallback for initialization
      setTimeout(() => {
        if (!this.isReady) {
          console.warn('[ML Service] Python worker initialization took longer than expected.');
          resolve(false);
        }
      }, 10000);
    });

    return this.initPromise;
  }

  async predict(text, threshold) {
    if (!this.process || !this.isReady) {
      await this.init();
    }

    if (!this.process || !this.isReady) {
      // Fallback if daemon cannot start
      return null;
    }

    const reqId = this.nextReqId++;
    const payload = JSON.stringify({ id: reqId, text, threshold }) + '\n';

    return new Promise((resolve) => {
      const timer = setTimeout(() => {
        if (this.pendingRequests.has(reqId)) {
          this.pendingRequests.delete(reqId);
          resolve({
            id: reqId,
            intent: 'unknown',
            confidence: 0.0,
            raw_intent: 'unknown',
            is_confident: false,
            top_predictions: [],
          });
        }
      }, 6000);

      this.pendingRequests.set(reqId, { resolve, timer });
      this.process.stdin.write(payload);
    });
  }
}

const worker = new PythonMLWorker();
// Warm up worker in background (only when running full local/container server with Python)
if (!process.env.VERCEL) {
  worker.init().catch(() => {});
}

/**
 * Predicts the intent and confidence of a given user message using the Python ML model.
 * 
 * @param {string} text - User message to classify
 * @param {number} [customThreshold] - Optional confidence threshold override
 * @returns {Promise<{ intent: string, confidence: number, raw_intent: string, is_confident: boolean, top_predictions: Array }>}
 */
export async function predictIntent(text, customThreshold) {
  const threshold = typeof customThreshold === 'number'
    ? customThreshold
    : parseFloat(process.env.ML_CONFIDENCE_THRESHOLD || '0.60');

  if (!text || typeof text !== 'string' || !text.trim()) {
    return {
      intent: 'unknown',
      confidence: 0.0,
      raw_intent: 'unknown',
      is_confident: false,
      top_predictions: [],
    };
  }

  try {
    const res = await worker.predict(text, threshold);
    if (res) {
      const rawConfidence = typeof res.confidence === 'number' ? res.confidence : 0.0;
      const rawIntent = res.raw_intent || res.intent || 'unknown';
      const isConfident = rawConfidence >= threshold;
      const finalIntent = isConfident ? rawIntent : 'unknown';

      return {
        intent: finalIntent,
        confidence: rawConfidence,
        raw_intent: rawIntent,
        is_confident: isConfident,
        top_predictions: res.top_predictions || [],
      };
    }
  } catch (err) {
    console.error('[ML Service Worker Error]', err);
  }

  // Fallback if worker was unavailable
  return {
    intent: 'unknown',
    confidence: 0.0,
    raw_intent: 'unknown',
    is_confident: false,
    top_predictions: [],
  };
}
