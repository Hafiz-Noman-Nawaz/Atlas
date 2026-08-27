import express from 'express';
import { predictIntent } from '../services/mlService.js';
import fs from 'fs';
import path from 'path';

const router = express.Router();

/**
 * @route   POST /api/ml/predict
 * @desc    Predict intent and confidence for any custom text query (used by ML Diagnostics playground)
 * @access  Public / Authenticated
 */
router.post('/predict', async (req, res, next) => {
  try {
    const { text, threshold } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ detail: 'Text prompt is required.' });
    }

    const thresh = threshold !== undefined ? parseFloat(threshold) : undefined;
    const result = await predictIntent(text.trim(), thresh);

    return res.json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/ml/info
 * @desc    Get ML model metadata, intent classes, and accuracy statistics
 * @access  Public
 */
router.get('/info', async (req, res, next) => {
  try {
    const metaPath = path.resolve(process.cwd(), '../ml/models/model_metadata.json');
    if (fs.existsSync(metaPath)) {
      const data = JSON.parse(fs.readFileSync(metaPath, 'utf-8'));
      return res.json(data);
    }
    return res.json({
      model_name: 'Calibrated LinearSVC',
      intents: 32,
      confidence_threshold: 0.50,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
