import api from './api';

export interface MLPredictionResult {
  intent: string;
  confidence: number;
  raw_intent: string;
  is_confident: boolean;
  top_predictions: Array<{
    intent: string;
    confidence: number;
  }>;
}

export interface MLInfoResult {
  model_name: string;
  total_examples?: number;
  num_intents?: number;
  intents?: string[] | number;
  confidence_threshold?: number;
  evaluation_metrics?: {
    test_accuracy?: number;
    macro_f1?: number;
  };
}

export const mlApi = {
  predict: async (text: string, threshold?: number): Promise<MLPredictionResult> => {
    const res = await api.post<MLPredictionResult>('/ml/predict', { text, threshold });
    return res.data;
  },

  getInfo: async (): Promise<MLInfoResult> => {
    const res = await api.get<MLInfoResult>('/ml/info');
    return res.data;
  },
};
